/**
 * Catálogo de Dimensões Disponíveis
 *
 * Define todas as dimensões (formas de agrupar dados) que podem ser usadas no Query Builder.
 */

export type DimensionType = 'entity' | 'temporal' | 'categorical' | 'geographical';
export type TemporalGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface Dimension {
  id: string;
  name: string;
  description: string;
  type: DimensionType;
  table?: string;  // Tabela de origem
  field?: string;  // Campo a selecionar
  sql?: string;    // SQL fragment customizado (para dimensões calculadas)
  requiresJoin?: string[];  // Tabelas necessárias
  groupable: boolean;  // Pode ser usado em GROUP BY
  filterable: boolean;  // Pode ser usado em WHERE
  sortable: boolean;    // Pode ser usado em ORDER BY
  icon?: string;
  // Para dimensões temporais
  granularity?: TemporalGranularity;
}

export const DIMENSIONS_CATALOG: Dimension[] = [
  // === ENTIDADES ===
  {
    id: 'channel',
    name: 'Canal de Venda',
    description: 'Agrupa por canal (Presencial, iFood, Rappi, etc)',
    type: 'entity',
    table: 'channels',
    field: 'name',
    requiresJoin: ['channels'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📱',
  },
  {
    id: 'store',
    name: 'Loja',
    description: 'Agrupa por loja/estabelecimento',
    type: 'entity',
    table: 'stores',
    field: 'name',
    requiresJoin: ['stores'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🏪',
  },
  {
    id: 'product',
    name: 'Produto',
    description: 'Agrupa por produto vendido',
    type: 'entity',
    table: 'products',
    field: 'name',
    requiresJoin: ['product_sales', 'products'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🍔',
  },
  {
    id: 'product_category',
    name: 'Categoria de Produto',
    description: 'Agrupa por categoria de produto',
    type: 'categorical',
    table: 'categories',
    field: 'name',
    requiresJoin: ['product_sales', 'products', 'categories'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📂',
  },
  {
    id: 'payment_type',
    name: 'Forma de Pagamento',
    description: 'Agrupa por tipo de pagamento',
    type: 'categorical',
    table: 'payment_types',
    field: 'description',
    requiresJoin: ['payments', 'payment_types'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '💳',
  },

  // === TEMPORAL - DIFERENTES GRANULARIDADES ===
  {
    id: 'date_hour',
    name: 'Hora',
    description: 'Agrupa por hora do dia',
    type: 'temporal',
    sql: 'EXTRACT(HOUR FROM s.created_at)',
    granularity: 'hour',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🕐',
  },
  {
    id: 'date_day',
    name: 'Data (Dia)',
    description: 'Agrupa por dia',
    type: 'temporal',
    sql: 'DATE(s.created_at)',
    granularity: 'day',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📅',
  },
  {
    id: 'date_week',
    name: 'Semana',
    description: 'Agrupa por semana',
    type: 'temporal',
    sql: 'DATE_TRUNC(\'week\', s.created_at)',
    granularity: 'week',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📆',
  },
  {
    id: 'date_month',
    name: 'Mês',
    description: 'Agrupa por mês',
    type: 'temporal',
    sql: 'DATE_TRUNC(\'month\', s.created_at)',
    granularity: 'month',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📆',
  },
  {
    id: 'date_quarter',
    name: 'Trimestre',
    description: 'Agrupa por trimestre',
    type: 'temporal',
    sql: 'DATE_TRUNC(\'quarter\', s.created_at)',
    granularity: 'quarter',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📊',
  },
  {
    id: 'date_year',
    name: 'Ano',
    description: 'Agrupa por ano',
    type: 'temporal',
    sql: 'DATE_TRUNC(\'year\', s.created_at)',
    granularity: 'year',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📅',
  },
  {
    id: 'day_of_week',
    name: 'Dia da Semana',
    description: 'Agrupa por dia da semana (Segunda, Terça, etc)',
    type: 'temporal',
    sql: 'TO_CHAR(s.created_at, \'Day\')',
    groupable: true,
    filterable: true,
    sortable: false,
    icon: '📆',
  },

  // === CATEGÓRICAS ===
  {
    id: 'sale_status',
    name: 'Status do Pedido',
    description: 'Agrupa por status (Concluído, Cancelado, etc)',
    type: 'categorical',
    table: 'sales',
    field: 'sale_status_desc',
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🏷️',
  },
  {
    id: 'channel_type',
    name: 'Tipo de Canal',
    description: 'Agrupa por tipo (Presencial vs Delivery)',
    type: 'categorical',
    table: 'channels',
    field: 'type',
    requiresJoin: ['channels'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🔀',
  },

  // === GEOGRÁFICAS ===
  {
    id: 'store_city',
    name: 'Cidade (Loja)',
    description: 'Agrupa por cidade da loja',
    type: 'geographical',
    table: 'stores',
    field: 'city',
    requiresJoin: ['stores'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🏙️',
  },
  {
    id: 'store_state',
    name: 'Estado (Loja)',
    description: 'Agrupa por estado da loja',
    type: 'geographical',
    table: 'stores',
    field: 'state',
    requiresJoin: ['stores'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🗺️',
  },
  {
    id: 'delivery_neighborhood',
    name: 'Bairro de Entrega',
    description: 'Agrupa por bairro de entrega',
    type: 'geographical',
    table: 'delivery_addresses',
    field: 'neighborhood',
    requiresJoin: ['delivery_addresses'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '📍',
  },
  {
    id: 'delivery_city',
    name: 'Cidade de Entrega',
    description: 'Agrupa por cidade de entrega',
    type: 'geographical',
    table: 'delivery_addresses',
    field: 'city',
    requiresJoin: ['delivery_addresses'],
    groupable: true,
    filterable: true,
    sortable: true,
    icon: '🏙️',
  },
];

/**
 * Busca dimensão por ID
 */
export function getDimensionById(id: string): Dimension | undefined {
  return DIMENSIONS_CATALOG.find(d => d.id === id);
}

/**
 * Busca dimensões por tipo
 */
export function getDimensionsByType(type: DimensionType): Dimension[] {
  return DIMENSIONS_CATALOG.filter(d => d.type === type);
}

/**
 * Retorna dimensões temporais disponíveis
 */
export function getTemporalDimensions(): Dimension[] {
  return DIMENSIONS_CATALOG.filter(d => d.type === 'temporal');
}

/**
 * Retorna apenas dimensões agrupaveis
 */
export function getGroupableDimensions(): Dimension[] {
  return DIMENSIONS_CATALOG.filter(d => d.groupable);
}
