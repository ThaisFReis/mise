/**
 * Query Builder Service
 *
 * Motor de queries dinâmicas que traduz configurações JSON em SQL otimizado.
 * Permite criação de análises customizadas sem escrever código.
 */

import { PrismaClient } from '@prisma/client';
import { getMetricById, type Metric } from '../config/metrics-catalog';
import { getDimensionById, type Dimension } from '../config/dimensions-catalog';
import RedisService from './RedisService';

const prisma = new PrismaClient();

export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'NOT IN' | 'LIKE' | 'BETWEEN';
export type LogicalOperator = 'AND' | 'OR';

export interface QueryFilter {
  field: string;  // ID da dimensão ou campo direto
  operator: FilterOperator;
  value: any;
  logicalOperator?: LogicalOperator;  // Como combinar com próximo filtro
}

export interface QueryConfig {
  metrics: string[];  // IDs das métricas
  dimensions?: string[];  // IDs das dimensões para agrupar
  filters?: QueryFilter[];
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
  // Comparação de períodos
  comparison?: {
    enabled: boolean;
    type: 'previous_period' | 'same_period_last_year' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
  };
}

export interface QueryResult {
  data: any[];
  comparisonData?: any[];
  metadata: {
    executionTime: number;
    rowCount: number;
    cacheHit: boolean;
  };
}

class QueryBuilderService {
  private readonly CACHE_TTL = 300; // 5 minutos

  /**
   * Executa query dinâmica baseada em configuração
   */
  async executeQuery(config: QueryConfig): Promise<QueryResult> {
    const startTime = Date.now();

    // Validar configuração
    this.validateConfig(config);

    // Tentar buscar do cache
    const cacheKey = this.generateCacheKey(config);
    const cachedResult = await RedisService.get(cacheKey);

    if (cachedResult) {
      return {
        ...JSON.parse(cachedResult),
        metadata: {
          ...JSON.parse(cachedResult).metadata,
          cacheHit: true,
        },
      };
    }

    // Construir e executar query
    const sql = this.buildSQL(config);
    console.log('[QueryBuilder] Executing SQL:', sql);

    const data = await prisma.$queryRawUnsafe(sql);

    // Se comparação está habilitada, executar query de comparação
    let comparisonData: any[] | undefined;
    if (config.comparison?.enabled) {
      const comparisonSQL = this.buildComparisonSQL(config);
      console.log('[QueryBuilder] Executing Comparison SQL:', comparisonSQL);
      comparisonData = await prisma.$queryRawUnsafe(comparisonSQL);
    }

    const result: QueryResult = {
      data: Array.isArray(data) ? data : [],
      comparisonData,
      metadata: {
        executionTime: Date.now() - startTime,
        rowCount: Array.isArray(data) ? data.length : 0,
        cacheHit: false,
      },
    };

    // Salvar no cache
    await RedisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * Valida configuração da query
   */
  private validateConfig(config: QueryConfig): void {
    if (!config.metrics || config.metrics.length === 0) {
      throw new Error('Pelo menos uma métrica deve ser selecionada');
    }

    // Validar que métricas existem
    for (const metricId of config.metrics) {
      const metric = getMetricById(metricId);
      if (!metric) {
        throw new Error(`Métrica '${metricId}' não encontrada`);
      }
    }

    // Validar que dimensões existem
    if (config.dimensions) {
      for (const dimId of config.dimensions) {
        const dimension = getDimensionById(dimId);
        if (!dimension) {
          throw new Error(`Dimensão '${dimId}' não encontrada`);
        }
        if (!dimension.groupable) {
          throw new Error(`Dimensão '${dimId}' não pode ser usada para agrupamento`);
        }
      }
    }

    // Validar limite
    if (config.limit && (config.limit < 1 || config.limit > 10000)) {
      throw new Error('Limite deve estar entre 1 e 10000');
    }
  }

  /**
   * Constrói SQL completo baseado na configuração
   */
  private buildSQL(config: QueryConfig): string {
    const selectedMetrics = config.metrics.map(id => getMetricById(id)!);
    const selectedDimensions = (config.dimensions || []).map(id => getDimensionById(id)!);

    // Determinar quais tabelas precisam ser joinadas
    const requiredJoins = this.determineRequiredJoins(selectedMetrics, selectedDimensions);

    // Construir partes da query
    const selectClause = this.buildSelectClause(selectedMetrics, selectedDimensions);
    const fromClause = this.buildFromClause(requiredJoins);
    const whereClause = this.buildWhereClause(config.filters || []);
    const groupByClause = this.buildGroupByClause(selectedDimensions);
    const orderByClause = this.buildOrderByClause(config.orderBy || [], selectedDimensions);
    const limitClause = config.limit ? `LIMIT ${config.limit}` : '';
    const offsetClause = config.offset ? `OFFSET ${config.offset}` : '';

    return `
      SELECT ${selectClause}
      FROM ${fromClause}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `.trim();
  }

  /**
   * Constrói cláusula SELECT
   */
  private buildSelectClause(metrics: Metric[], dimensions: Dimension[]): string {
    const parts: string[] = [];

    // Adicionar dimensões
    for (const dim of dimensions) {
      const fieldSql = dim.sql || `${dim.table}.${dim.field}`;
      parts.push(`${fieldSql} AS "${dim.id}"`);
    }

    // Adicionar métricas
    for (const metric of metrics) {
      parts.push(`${metric.sql} AS "${metric.id}"`);
    }

    return parts.join(',\n       ');
  }

  /**
   * Constrói cláusula FROM com JOINs necessários
   */
  private buildFromClause(requiredJoins: Set<string>): string {
    let from = 'sales s';

    // JOINs padrão sempre incluídos
    const joins: string[] = [];

    if (requiredJoins.has('channels')) {
      joins.push('LEFT JOIN channels ON channels.id = s.channel_id');
    }
    if (requiredJoins.has('stores')) {
      joins.push('LEFT JOIN stores ON stores.id = s.store_id');
    }
    if (requiredJoins.has('product_sales')) {
      joins.push('LEFT JOIN product_sales ps ON ps.sale_id = s.id');
    }
    if (requiredJoins.has('products')) {
      joins.push('LEFT JOIN products ON products.id = ps.product_id');
    }
    if (requiredJoins.has('categories')) {
      joins.push('LEFT JOIN categories ON categories.id = products.category_id');
    }
    if (requiredJoins.has('payments')) {
      joins.push('LEFT JOIN payments ON payments.sale_id = s.id');
    }
    if (requiredJoins.has('payment_types')) {
      joins.push('LEFT JOIN payment_types ON payment_types.id = payments.payment_type_id');
    }
    if (requiredJoins.has('delivery_addresses')) {
      joins.push('LEFT JOIN delivery_addresses ON delivery_addresses.sale_id = s.id');
    }

    return from + (joins.length > 0 ? '\n       ' + joins.join('\n       ') : '');
  }

  /**
   * Constrói cláusula WHERE
   */
  private buildWhereClause(filters: QueryFilter[]): string {
    if (filters.length === 0) return '';

    const conditions: string[] = [];

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      const dimension = getDimensionById(filter.field);
      const fieldSql = dimension?.sql || `s.${filter.field}`;

      let condition = '';

      switch (filter.operator) {
        case '=':
        case '!=':
        case '>':
        case '<':
        case '>=':
        case '<=':
          condition = `${fieldSql} ${filter.operator} ${this.formatValue(filter.value)}`;
          break;
        case 'IN':
        case 'NOT IN':
          const values = Array.isArray(filter.value)
            ? filter.value.map(v => this.formatValue(v)).join(', ')
            : this.formatValue(filter.value);
          condition = `${fieldSql} ${filter.operator} (${values})`;
          break;
        case 'LIKE':
          condition = `${fieldSql} LIKE ${this.formatValue(`%${filter.value}%`)}`;
          break;
        case 'BETWEEN':
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            condition = `${fieldSql} BETWEEN ${this.formatValue(filter.value[0])} AND ${this.formatValue(filter.value[1])}`;
          }
          break;
      }

      if (condition) {
        if (i > 0) {
          const logicalOp = filters[i - 1].logicalOperator || 'AND';
          conditions.push(`${logicalOp} ${condition}`);
        } else {
          conditions.push(condition);
        }
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' ')}` : '';
  }

  /**
   * Constrói cláusula GROUP BY
   */
  private buildGroupByClause(dimensions: Dimension[]): string {
    if (dimensions.length === 0) return '';

    const groupFields = dimensions.map((dim, idx) => `${idx + 1}`);
    return `GROUP BY ${groupFields.join(', ')}`;
  }

  /**
   * Constrói cláusula ORDER BY
   */
  private buildOrderByClause(
    orderBy: { field: string; direction: 'ASC' | 'DESC' }[],
    dimensions: Dimension[]
  ): string {
    if (orderBy.length === 0 && dimensions.length > 0) {
      // Default: ordenar pela primeira dimensão
      return `ORDER BY 1 ASC`;
    }

    if (orderBy.length === 0) return '';

    const orderClauses = orderBy.map(order => {
      return `"${order.field}" ${order.direction}`;
    });

    return `ORDER BY ${orderClauses.join(', ')}`;
  }

  /**
   * Determina quais JOINs são necessários
   */
  private determineRequiredJoins(metrics: Metric[], dimensions: Dimension[]): Set<string> {
    const joins = new Set<string>();

    for (const metric of metrics) {
      if (metric.requiresJoin) {
        metric.requiresJoin.forEach(j => joins.add(j));
      }
    }

    for (const dimension of dimensions) {
      if (dimension.requiresJoin) {
        dimension.requiresJoin.forEach(j => joins.add(j));
      } else if (dimension.table && dimension.table !== 'sales') {
        joins.add(dimension.table);
      }
    }

    return joins;
  }

  /**
   * Formata valor para SQL (escape básico)
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    // String: escape de aspas simples
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  /**
   * Constrói SQL para comparação de período
   */
  private buildComparisonSQL(config: QueryConfig): string {
    if (!config.comparison?.enabled) return '';

    // Clonar config e ajustar filtros de data
    const comparisonConfig = { ...config };

    // Encontrar filtro de data existente
    const dateFilter = config.filters?.find(f => f.field.includes('date') || f.field === 'created_at');

    if (!dateFilter) {
      throw new Error('Comparação de período requer filtro de data');
    }

    // Calcular período de comparação
    let comparisonStartDate: Date;
    let comparisonEndDate: Date;

    const currentStart = new Date(Array.isArray(dateFilter.value) ? dateFilter.value[0] : dateFilter.value);
    const currentEnd = dateFilter.operator === 'BETWEEN' && Array.isArray(dateFilter.value)
      ? new Date(dateFilter.value[1])
      : new Date();

    const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

    switch (config.comparison.type) {
      case 'previous_period':
        comparisonEndDate = new Date(currentStart);
        comparisonEndDate.setDate(comparisonEndDate.getDate() - 1);
        comparisonStartDate = new Date(comparisonEndDate);
        comparisonStartDate.setDate(comparisonStartDate.getDate() - periodDays);
        break;

      case 'same_period_last_year':
        comparisonStartDate = new Date(currentStart);
        comparisonStartDate.setFullYear(comparisonStartDate.getFullYear() - 1);
        comparisonEndDate = new Date(currentEnd);
        comparisonEndDate.setFullYear(comparisonEndDate.getFullYear() - 1);
        break;

      case 'custom':
        if (!config.comparison.customStartDate || !config.comparison.customEndDate) {
          throw new Error('Comparação customizada requer datas de início e fim');
        }
        comparisonStartDate = new Date(config.comparison.customStartDate);
        comparisonEndDate = new Date(config.comparison.customEndDate);
        break;

      default:
        throw new Error('Tipo de comparação inválido');
    }

    // Atualizar filtros com novo período
    comparisonConfig.filters = (config.filters || []).map(f => {
      if (f.field.includes('date') || f.field === 'created_at') {
        return {
          ...f,
          value: [comparisonStartDate.toISOString(), comparisonEndDate.toISOString()],
          operator: 'BETWEEN' as FilterOperator,
        };
      }
      return f;
    });

    return this.buildSQL(comparisonConfig);
  }

  /**
   * Gera chave de cache única para a query
   */
  private generateCacheKey(config: QueryConfig): string {
    const configStr = JSON.stringify(config);
    return `query:${Buffer.from(configStr).toString('base64').substring(0, 32)}`;
  }

  /**
   * Preview de dados (primeiros 10 registros)
   */
  async preview(config: QueryConfig): Promise<QueryResult> {
    const previewConfig = {
      ...config,
      limit: 10,
      offset: 0,
    };
    return this.executeQuery(previewConfig);
  }
}

export default new QueryBuilderService();
