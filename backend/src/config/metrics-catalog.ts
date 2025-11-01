/**
 * Catálogo de Métricas Disponíveis
 *
 * Define todas as métricas que podem ser usadas no Query Builder.
 * Cada métrica contém a lógica SQL necessária para seu cálculo.
 */

export type MetricFormat = 'currency' | 'number' | 'percentage' | 'duration';
export type MetricCategory = 'Vendas' | 'Financeiro' | 'Operacional' | 'Cliente' | 'Produto';

export interface Metric {
  id: string;
  name: string;
  description: string;
  sql: string;  // SQL fragment para agregação
  format: MetricFormat;
  category: MetricCategory;
  requiresJoin?: string[];  // Tabelas necessárias
  icon?: string;
}

export const METRICS_CATALOG: Metric[] = [
  // === VENDAS ===
  {
    id: 'total_sales',
    name: 'Faturamento Total',
    description: 'Soma do valor total de todas as vendas (total_amount)',
    sql: 'SUM(s.total_amount)',
    format: 'currency',
    category: 'Vendas',
    icon: '💰',
  },
  {
    id: 'total_sales_net',
    name: 'Faturamento Líquido',
    description: 'Faturamento total menos descontos',
    sql: 'SUM(s.total_amount - s.total_discount)',
    format: 'currency',
    category: 'Vendas',
    icon: '💵',
  },
  {
    id: 'order_count',
    name: 'Número de Pedidos',
    description: 'Quantidade total de pedidos',
    sql: 'COUNT(s.id)',
    format: 'number',
    category: 'Vendas',
    icon: '📦',
  },
  {
    id: 'avg_ticket',
    name: 'Ticket Médio',
    description: 'Valor médio por pedido (total_amount médio)',
    sql: 'AVG(s.total_amount)',
    format: 'currency',
    category: 'Vendas',
    icon: '🎫',
  },
  {
    id: 'total_items_sold',
    name: 'Itens Vendidos',
    description: 'Quantidade total de produtos vendidos',
    sql: 'SUM(ps.quantity)',
    format: 'number',
    category: 'Vendas',
    requiresJoin: ['product_sales'],
    icon: '📊',
  },
  {
    id: 'avg_items_per_order',
    name: 'Itens por Pedido',
    description: 'Média de produtos por pedido',
    sql: 'AVG(ps.quantity)',
    format: 'number',
    category: 'Vendas',
    requiresJoin: ['product_sales'],
    icon: '🛒',
  },

  // === FINANCEIRO ===
  {
    id: 'total_discount',
    name: 'Total de Descontos',
    description: 'Soma de todos os descontos aplicados',
    sql: 'SUM(s.total_discount)',
    format: 'currency',
    category: 'Financeiro',
    icon: '🏷️',
  },
  {
    id: 'discount_rate',
    name: 'Taxa de Desconto',
    description: 'Percentual médio de desconto aplicado',
    sql: '(SUM(s.total_discount) * 100.0 / NULLIF(SUM(s.total_amount + s.total_discount), 0))',
    format: 'percentage',
    category: 'Financeiro',
    icon: '📉',
  },
  {
    id: 'total_delivery_fee',
    name: 'Taxa de Entrega Total',
    description: 'Soma de todas as taxas de entrega cobradas',
    sql: 'SUM(s.delivery_fee)',
    format: 'currency',
    category: 'Financeiro',
    icon: '🚚',
  },
  {
    id: 'total_service_fee',
    name: 'Taxa de Serviço Total',
    description: 'Soma de todas as taxas de serviço',
    sql: 'SUM(s.service_tax_fee)',
    format: 'currency',
    category: 'Financeiro',
    icon: '🧾',
  },
  {
    id: 'avg_profit_margin',
    name: 'Margem de Lucro Bruto',
    description: 'Margem percentual média (requer dados de custo)',
    sql: 'AVG(((s.total_amount - COALESCE(s.total_discount, 0)) * 100.0) / NULLIF(s.total_amount, 0))',
    format: 'percentage',
    category: 'Financeiro',
    icon: '📈',
  },

  // === OPERACIONAL ===
  {
    id: 'avg_production_time',
    name: 'Tempo Médio de Preparo',
    description: 'Tempo médio de produção em minutos',
    sql: 'AVG(s.production_seconds / 60.0)',
    format: 'duration',
    category: 'Operacional',
    icon: '⏱️',
  },
  {
    id: 'avg_delivery_time',
    name: 'Tempo Médio de Entrega',
    description: 'Tempo médio de entrega em minutos',
    sql: 'AVG(s.delivery_seconds / 60.0)',
    format: 'duration',
    category: 'Operacional',
    icon: '🚴',
  },
  {
    id: 'cancellation_rate',
    name: 'Taxa de Cancelamento',
    description: 'Percentual de pedidos cancelados',
    sql: '(COUNT(*) FILTER (WHERE s.sale_status_desc = \'CANCELLED\') * 100.0 / NULLIF(COUNT(*), 0))',
    format: 'percentage',
    category: 'Operacional',
    icon: '❌',
  },
  {
    id: 'completion_rate',
    name: 'Taxa de Conclusão',
    description: 'Percentual de pedidos concluídos com sucesso',
    sql: '(COUNT(*) FILTER (WHERE s.sale_status_desc = \'COMPLETED\') * 100.0 / NULLIF(COUNT(*), 0))',
    format: 'percentage',
    category: 'Operacional',
    icon: '✅',
  },

  // === CLIENTE ===
  {
    id: 'unique_customers',
    name: 'Clientes Únicos',
    description: 'Número de clientes distintos',
    sql: 'COUNT(DISTINCT s.customer_id)',
    format: 'number',
    category: 'Cliente',
    icon: '👥',
  },
  {
    id: 'avg_people_per_order',
    name: 'Pessoas por Pedido',
    description: 'Quantidade média de pessoas por pedido',
    sql: 'AVG(s.people_quantity)',
    format: 'number',
    category: 'Cliente',
    icon: '👨‍👩‍👧‍👦',
  },

  // === PRODUTO ===
  {
    id: 'product_variety',
    name: 'Variedade de Produtos',
    description: 'Número de produtos diferentes vendidos',
    sql: 'COUNT(DISTINCT ps.product_id)',
    format: 'number',
    category: 'Produto',
    requiresJoin: ['product_sales'],
    icon: '🍔',
  },
];

/**
 * Busca métrica por ID
 */
export function getMetricById(id: string): Metric | undefined {
  return METRICS_CATALOG.find(m => m.id === id);
}

/**
 * Busca métricas por categoria
 */
export function getMetricsByCategory(category: MetricCategory): Metric[] {
  return METRICS_CATALOG.filter(m => m.category === category);
}

/**
 * Retorna todas as categorias disponíveis
 */
export function getCategories(): MetricCategory[] {
  return ['Vendas', 'Financeiro', 'Operacional', 'Cliente', 'Produto'];
}
