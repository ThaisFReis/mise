/**
 * Sistema de tradução para colunas do banco de dados
 * Converte nomes técnicos (em inglês) para português
 */

export const columnTranslations: Record<string, string> = {
  // Dimensões de Canal
  'channel': 'Canal',
  'channel_id': 'ID do Canal',
  'channel_name': 'Nome do Canal',
  'channel_type': 'Tipo de Canal',

  // Dimensões de Loja
  'store': 'Loja',
  'store_id': 'ID da Loja',
  'store_name': 'Nome da Loja',
  'store_location': 'Localização da Loja',
  'store_city': 'Cidade',
  'store_state': 'Estado',

  // Dimensões de Produto
  'product': 'Produto',
  'product_id': 'ID do Produto',
  'product_name': 'Nome do Produto',
  'product_category': 'Categoria',
  'product_subcategory': 'Subcategoria',
  'product_brand': 'Marca',
  'product_sku': 'SKU',

  // Dimensões de Cliente
  'customer': 'Cliente',
  'customer_id': 'ID do Cliente',
  'customer_name': 'Nome do Cliente',
  'customer_segment': 'Segmento',
  'customer_type': 'Tipo de Cliente',
  'customer_city': 'Cidade do Cliente',
  'customer_state': 'Estado do Cliente',

  // Dimensões de Pagamento
  'payment_method': 'Método de Pagamento',
  'payment_type': 'Tipo de Pagamento',
  'payment_status': 'Status do Pagamento',

  // Dimensões Temporais
  'date': 'Data',
  'day': 'Dia',
  'day_of_week': 'Dia da Semana',
  'week': 'Semana',
  'month': 'Mês',
  'quarter': 'Trimestre',
  'year': 'Ano',
  'hour': 'Hora',
  'period': 'Período',
  'created_at': 'Data de Criação',
  'updated_at': 'Data de Atualização',

  // Métricas de Vendas
  'total_sales': 'Total de Vendas',
  'total_sales_net': 'Vendas Líquidas',
  'total_sales_gross': 'Vendas Brutas',
  'sales': 'Vendas',
  'sales_amount': 'Valor de Vendas',
  'revenue': 'Receita',
  'total_revenue': 'Receita Total',

  // Métricas de Pedidos
  'order_count': 'Quantidade de Pedidos',
  'orders': 'Pedidos',
  'total_orders': 'Total de Pedidos',
  'order_value': 'Valor do Pedido',
  'avg_order_value': 'Valor Médio do Pedido',

  // Métricas de Ticket
  'avg_ticket': 'Ticket Médio',
  'ticket_medio': 'Ticket Médio',
  'average_ticket': 'Ticket Médio',
  'ticket_value': 'Valor do Ticket',

  // Métricas de Itens
  'item_count': 'Quantidade de Itens',
  'items': 'Itens',
  'total_items': 'Total de Itens',
  'items_sold': 'Itens Vendidos',
  'quantity': 'Quantidade',
  'total_quantity': 'Quantidade Total',

  // Métricas de Desconto
  'total_discount': 'Total de Descontos',
  'discount': 'Desconto',
  'discount_amount': 'Valor de Desconto',
  'discount_rate': 'Taxa de Desconto',
  'discount_percentage': 'Percentual de Desconto',

  // Métricas de Margem e Custo
  'total_amount': 'Valor Total',
  'amount': 'Valor',
  'total_amount_items': 'Valor Total dos Itens',
  'cost': 'Custo',
  'total_cost': 'Custo Total',
  'margin': 'Margem',
  'profit_margin': 'Margem de Lucro',
  'gross_margin': 'Margem Bruta',
  'net_margin': 'Margem Líquida',

  // Métricas de Taxas e Fees
  'fee': 'Taxa',
  'total_fee': 'Total de Taxas',
  'delivery_fee': 'Taxa de Entrega',
  'service_fee': 'Taxa de Serviço',
  'transaction_fee': 'Taxa de Transação',

  // Métricas de Cancelamento
  'cancellation_rate': 'Taxa de Cancelamento',
  'canceled_orders': 'Pedidos Cancelados',
  'cancellations': 'Cancelamentos',

  // Métricas de Performance
  'conversion_rate': 'Taxa de Conversão',
  'retention_rate': 'Taxa de Retenção',
  'churn_rate': 'Taxa de Churn',
  'growth_rate': 'Taxa de Crescimento',

  // Status
  'status': 'Status',
  'sale_status': 'Status da Venda',
  'order_status': 'Status do Pedido',

  // Outros
  'count': 'Contagem',
  'total': 'Total',
  'average': 'Média',
  'avg': 'Média',
  'sum': 'Soma',
  'min': 'Mínimo',
  'max': 'Máximo',
  'price': 'Preço',
  'unit_price': 'Preço Unitário',
  'description': 'Descrição',
  'name': 'Nome',
  'id': 'ID',
  'type': 'Tipo',
};

/**
 * Traduz o nome de uma coluna do inglês para português
 * @param key - Nome da coluna em inglês
 * @returns Nome traduzido em português
 */
export function translateColumn(key: string): string {
  // Tenta encontrar tradução exata
  if (columnTranslations[key]) {
    return columnTranslations[key];
  }

  // Tenta encontrar tradução em lowercase
  const lowerKey = key.toLowerCase();
  if (columnTranslations[lowerKey]) {
    return columnTranslations[lowerKey];
  }

  // Fallback: formata o nome substituindo underscores e capitalizando
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Traduz múltiplas colunas de uma vez
 * @param keys - Array de nomes de colunas
 * @returns Array de nomes traduzidos
 */
export function translateColumns(keys: string[]): string[] {
  return keys.map(translateColumn);
}

/**
 * Cria um objeto com mapeamento chave original -> tradução
 * @param keys - Array de nomes de colunas
 * @returns Objeto com mapeamento
 */
export function createTranslationMap(keys: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  keys.forEach(key => {
    map[key] = translateColumn(key);
  });
  return map;
}
