/**
 * Dashboard Templates
 *
 * Templates pré-configurados de dashboards para acelerar a adoção
 */

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vendas' | 'financeiro' | 'operacional' | 'produtos' | 'clientes';
  icon: string;
  config: {
    widgets: WidgetConfig[];
    layout: GridLayout[];
    filters?: any[];
  };
}

export interface WidgetConfig {
  id: string;
  type: 'chart' | 'table' | 'kpi';
  title: string;
  queryConfig: {
    metrics: string[];
    dimensions?: string[];
    filters?: any[];
    orderBy?: any[];
    limit?: number;
  };
  visualizationConfig: {
    type: 'line' | 'bar' | 'pie' | 'area' | 'table' | 'kpi';
    config?: any;
  };
}

export interface GridLayout {
  i: string;  // Widget ID
  x: number;
  y: number;
  w: number;  // Width (columns)
  h: number;  // Height (rows)
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  // === 1. VISÃO GERAL FINANCEIRA ===
  {
    id: 'financial-overview',
    name: 'Visão Geral Financeira',
    description: 'Dashboard completo com faturamento, lucro, custos e principais métricas financeiras',
    category: 'financeiro',
    icon: '💰',
    config: {
      widgets: [
        // KPI Cards
        {
          id: 'kpi-revenue',
          type: 'kpi',
          title: 'Faturamento Total',
          queryConfig: {
            metrics: ['total_sales'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '💰', trend: true },
          },
        },
        {
          id: 'kpi-orders',
          type: 'kpi',
          title: 'Total de Pedidos',
          queryConfig: {
            metrics: ['order_count'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '📦', trend: true },
          },
        },
        {
          id: 'kpi-avg-ticket',
          type: 'kpi',
          title: 'Ticket Médio',
          queryConfig: {
            metrics: ['avg_ticket'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '🎫', trend: true },
          },
        },
        {
          id: 'kpi-discount-rate',
          type: 'kpi',
          title: 'Taxa de Desconto',
          queryConfig: {
            metrics: ['discount_rate'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '🏷️', trend: true },
          },
        },
        // Revenue Trend
        {
          id: 'chart-revenue-trend',
          type: 'chart',
          title: 'Faturamento ao Longo do Tempo',
          queryConfig: {
            metrics: ['total_sales', 'order_count'],
            dimensions: ['date_day'],
            orderBy: [{ field: 'date_day', direction: 'ASC' }],
          },
          visualizationConfig: {
            type: 'line',
            config: { showGrid: true, showLegend: true },
          },
        },
        // Revenue by Channel
        {
          id: 'chart-revenue-by-channel',
          type: 'chart',
          title: 'Faturamento por Canal',
          queryConfig: {
            metrics: ['total_sales'],
            dimensions: ['channel'],
            orderBy: [{ field: 'total_sales', direction: 'DESC' }],
          },
          visualizationConfig: {
            type: 'bar',
          },
        },
      ],
      layout: [
        { i: 'kpi-revenue', x: 0, y: 0, w: 3, h: 2 },
        { i: 'kpi-orders', x: 3, y: 0, w: 3, h: 2 },
        { i: 'kpi-avg-ticket', x: 6, y: 0, w: 3, h: 2 },
        { i: 'kpi-discount-rate', x: 9, y: 0, w: 3, h: 2 },
        { i: 'chart-revenue-trend', x: 0, y: 2, w: 8, h: 4 },
        { i: 'chart-revenue-by-channel', x: 8, y: 2, w: 4, h: 4 },
      ],
    },
  },

  // === 2. PERFORMANCE DE VENDAS ===
  {
    id: 'sales-performance',
    name: 'Performance de Vendas',
    description: 'Análise detalhada de pedidos, ticket médio e performance por canal',
    category: 'vendas',
    icon: '📊',
    config: {
      widgets: [
        {
          id: 'kpi-total-orders',
          type: 'kpi',
          title: 'Pedidos do Período',
          queryConfig: {
            metrics: ['order_count'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '📦' },
          },
        },
        {
          id: 'kpi-completion-rate',
          type: 'kpi',
          title: 'Taxa de Conclusão',
          queryConfig: {
            metrics: ['completion_rate'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '✅' },
          },
        },
        {
          id: 'chart-orders-by-channel',
          type: 'chart',
          title: 'Pedidos por Canal',
          queryConfig: {
            metrics: ['order_count', 'avg_ticket'],
            dimensions: ['channel'],
            orderBy: [{ field: 'order_count', direction: 'DESC' }],
          },
          visualizationConfig: {
            type: 'bar',
          },
        },
        {
          id: 'chart-orders-by-day',
          type: 'chart',
          title: 'Pedidos por Dia da Semana',
          queryConfig: {
            metrics: ['order_count', 'total_sales'],
            dimensions: ['day_of_week'],
          },
          visualizationConfig: {
            type: 'bar',
          },
        },
        {
          id: 'table-top-stores',
          type: 'table',
          title: 'Top 10 Lojas',
          queryConfig: {
            metrics: ['total_sales', 'order_count', 'avg_ticket'],
            dimensions: ['store'],
            orderBy: [{ field: 'total_sales', direction: 'DESC' }],
            limit: 10,
          },
          visualizationConfig: {
            type: 'table',
          },
        },
      ],
      layout: [
        { i: 'kpi-total-orders', x: 0, y: 0, w: 4, h: 2 },
        { i: 'kpi-completion-rate', x: 4, y: 0, w: 4, h: 2 },
        { i: 'chart-orders-by-channel', x: 0, y: 2, w: 6, h: 4 },
        { i: 'chart-orders-by-day', x: 6, y: 2, w: 6, h: 4 },
        { i: 'table-top-stores', x: 0, y: 6, w: 12, h: 4 },
      ],
    },
  },

  // === 3. ANÁLISE DE PRODUTOS ===
  {
    id: 'product-analysis',
    name: 'Análise de Produtos',
    description: 'Top sellers, categorias mais vendidas e variedade de produtos',
    category: 'produtos',
    icon: '🍔',
    config: {
      widgets: [
        {
          id: 'kpi-total-items-sold',
          type: 'kpi',
          title: 'Itens Vendidos',
          queryConfig: {
            metrics: ['total_items_sold'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '📊' },
          },
        },
        {
          id: 'kpi-product-variety',
          type: 'kpi',
          title: 'Variedade de Produtos',
          queryConfig: {
            metrics: ['product_variety'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '🍔' },
          },
        },
        {
          id: 'table-top-products',
          type: 'table',
          title: 'Top 20 Produtos',
          queryConfig: {
            metrics: ['total_sales', 'total_items_sold'],
            dimensions: ['product'],
            orderBy: [{ field: 'total_sales', direction: 'DESC' }],
            limit: 20,
          },
          visualizationConfig: {
            type: 'table',
          },
        },
        {
          id: 'chart-revenue-by-category',
          type: 'chart',
          title: 'Faturamento por Categoria',
          queryConfig: {
            metrics: ['total_sales'],
            dimensions: ['product_category'],
            orderBy: [{ field: 'total_sales', direction: 'DESC' }],
          },
          visualizationConfig: {
            type: 'pie',
          },
        },
      ],
      layout: [
        { i: 'kpi-total-items-sold', x: 0, y: 0, w: 6, h: 2 },
        { i: 'kpi-product-variety', x: 6, y: 0, w: 6, h: 2 },
        { i: 'table-top-products', x: 0, y: 2, w: 8, h: 6 },
        { i: 'chart-revenue-by-category', x: 8, y: 2, w: 4, h: 6 },
      ],
    },
  },

  // === 4. COMPARAÇÃO TEMPORAL ===
  {
    id: 'temporal-comparison',
    name: 'Comparação de Períodos',
    description: 'Compare performance entre diferentes períodos de tempo',
    category: 'vendas',
    icon: '📆',
    config: {
      widgets: [
        {
          id: 'chart-revenue-comparison',
          type: 'chart',
          title: 'Faturamento: Este Período vs Anterior',
          queryConfig: {
            metrics: ['total_sales'],
            dimensions: ['date_week'],
            orderBy: [{ field: 'date_week', direction: 'ASC' }],
          },
          visualizationConfig: {
            type: 'line',
            config: { comparison: { enabled: true, type: 'previous_period' } },
          },
        },
        {
          id: 'chart-orders-comparison',
          type: 'chart',
          title: 'Pedidos: Este Mês vs Mês Passado',
          queryConfig: {
            metrics: ['order_count'],
            dimensions: ['date_day'],
            orderBy: [{ field: 'date_day', direction: 'ASC' }],
          },
          visualizationConfig: {
            type: 'area',
            config: { comparison: { enabled: true, type: 'previous_period' } },
          },
        },
      ],
      layout: [
        { i: 'chart-revenue-comparison', x: 0, y: 0, w: 6, h: 5 },
        { i: 'chart-orders-comparison', x: 6, y: 0, w: 6, h: 5 },
      ],
    },
  },

  // === 5. PERFORMANCE OPERACIONAL ===
  {
    id: 'operational-performance',
    name: 'Performance Operacional',
    description: 'Métricas operacionais: tempo de preparo, entrega e taxas de cancelamento',
    category: 'operacional',
    icon: '⏱️',
    config: {
      widgets: [
        {
          id: 'kpi-avg-production-time',
          type: 'kpi',
          title: 'Tempo Médio de Preparo',
          queryConfig: {
            metrics: ['avg_production_time'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '⏱️', suffix: ' min' },
          },
        },
        {
          id: 'kpi-avg-delivery-time',
          type: 'kpi',
          title: 'Tempo Médio de Entrega',
          queryConfig: {
            metrics: ['avg_delivery_time'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '🚴', suffix: ' min' },
          },
        },
        {
          id: 'kpi-cancellation-rate',
          type: 'kpi',
          title: 'Taxa de Cancelamento',
          queryConfig: {
            metrics: ['cancellation_rate'],
          },
          visualizationConfig: {
            type: 'kpi',
            config: { icon: '❌', suffix: '%' },
          },
        },
        {
          id: 'chart-production-by-hour',
          type: 'chart',
          title: 'Tempo de Preparo por Hora do Dia',
          queryConfig: {
            metrics: ['avg_production_time'],
            dimensions: ['date_hour'],
            orderBy: [{ field: 'date_hour', direction: 'ASC' }],
          },
          visualizationConfig: {
            type: 'line',
          },
        },
        {
          id: 'table-stores-performance',
          type: 'table',
          title: 'Performance por Loja',
          queryConfig: {
            metrics: ['order_count', 'avg_production_time', 'avg_delivery_time', 'cancellation_rate'],
            dimensions: ['store'],
            orderBy: [{ field: 'order_count', direction: 'DESC' }],
            limit: 15,
          },
          visualizationConfig: {
            type: 'table',
          },
        },
      ],
      layout: [
        { i: 'kpi-avg-production-time', x: 0, y: 0, w: 4, h: 2 },
        { i: 'kpi-avg-delivery-time', x: 4, y: 0, w: 4, h: 2 },
        { i: 'kpi-cancellation-rate', x: 8, y: 0, w: 4, h: 2 },
        { i: 'chart-production-by-hour', x: 0, y: 2, w: 6, h: 4 },
        { i: 'table-stores-performance', x: 0, y: 6, w: 12, h: 4 },
      ],
    },
  },
];

/**
 * Busca template por ID
 */
export function getTemplateById(id: string): DashboardTemplate | undefined {
  return DASHBOARD_TEMPLATES.find(t => t.id === id);
}

/**
 * Busca templates por categoria
 */
export function getTemplatesByCategory(category: string): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES.filter(t => t.category === category);
}

/**
 * Retorna lista de categorias
 */
export function getTemplateCategories(): string[] {
  return ['vendas', 'financeiro', 'operacional', 'produtos', 'clientes'];
}
