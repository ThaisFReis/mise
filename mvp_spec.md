# 📋 Especificação MVP - Analytics para Restaurantes

## 🎯 Objetivo do MVP

Permitir que donos de restaurantes **explorem seus dados operacionais de forma intuitiva** e obtenham **insights acionáveis** sem conhecimento técnico, focando nas perguntas mais críticas do dia-a-dia.

---

## 👤 Persona Principal

**Maria** - Dona de 3 restaurantes
- Não tem conhecimento técnico profundo
- Precisa tomar decisões rápidas baseadas em dados
- Tem 15-30 minutos por dia para analisar performance
- Acessa principalmente de tablet/desktop durante o dia

---

## 🎪 Funcionalidades Core (Must-Have)

### 1. Dashboard Overview (Tela Inicial)
**Objetivo**: Visão rápida da saúde do negócio em < 10 segundos

**Métricas principais** (período selecionável: hoje, semana, mês):
- Faturamento total + comparação período anterior (%)
- Número de vendas + comparação
- Ticket médio + comparação
- Taxa de cancelamento
- Top 5 produtos mais vendidos (quantidade + revenue)
- Faturamento por canal (presencial vs delivery)
- Gráfico de vendas por hora do dia (identificar picos)

**Filtros globais**:
- Período (hoje, últimos 7 dias, últimos 30 dias, custom)
- Loja (todas, individual, comparação entre lojas)

---

### 2. Explorador de Produtos
**Objetivo**: Entender performance do cardápio

**Visualizações**:
- **Tabela de produtos** com:
  - Nome do produto
  - Categoria
  - Quantidade vendida
  - Receita gerada
  - Ticket médio
  - % do total de vendas
  - Trend (↑↓→) vs período anterior
  
- **Análise de customizações**:
  - Itens mais adicionados (bacon, queijo extra, etc)
  - Itens mais removidos
  - Receita adicional de customizações

- **Combinações frequentes**:
  - Produtos vendidos juntos (market basket analysis simples)

**Filtros**:
- Categoria
- Canal de venda
- Período
- Loja

**Ações**:
- Exportar para CSV/Excel
- Ver detalhes do produto (drill-down)

---

### 3. Análise de Canais
**Objetivo**: Comparar performance entre canais de venda

**Métricas por canal**:
- Faturamento total
- Número de pedidos
- Ticket médio
- Produtos mais vendidos
- Horários de pico
- Taxa de cancelamento
- Tempo médio de preparo/entrega

**Visualizações**:
- Gráfico de pizza: distribuição de vendas por canal
- Gráfico de barras: comparação de ticket médio
- Linha do tempo: evolução por canal

---

### 4. Performance de Lojas
**Objetivo**: Identificar lojas com melhor/pior desempenho

**Comparação entre lojas**:
- Faturamento
- Número de vendas
- Ticket médio
- Produtos mais vendidos por loja
- Rating/performance operacional (tempo de preparo)

**Visualização**:
- Tabela comparativa
- Gráfico de barras side-by-side
- Mapa (se houver coordenadas)

---

### 5. Análise Temporal
**Objetivo**: Identificar padrões e tendências ao longo do tempo

**Visualizações**:
- **Linha do tempo**: Faturamento diário/semanal/mensal
- **Heatmap**: Vendas por dia da semana vs hora do dia
- **Comparação de períodos**: Mês atual vs mês anterior

**Insights automáticos**:
- "Suas vendas cresceram 15% em relação ao mês passado"
- "Quinta-feira à noite é seu horário de pico"
- "Houve uma queda de 30% na semana de X" (anomalia)

---

### 6. Relatórios Rápidos (Pré-configurados)
**Objetivo**: Responder perguntas comuns sem configuração

**Relatórios disponíveis**:
1. "Top 10 produtos da semana"
2. "Performance por horário de pico"
3. "Análise de delivery vs presencial"
4. "Produtos com maior margem" (se tiver custo)
5. "Resumo mensal executivo"

**Output**:
- Visualização na tela
- Download PDF/Excel
- Envio por email (nice-to-have)

---

## 🎨 Stack Tecnológica Recomendada

### Backend
**Opção 1 - Node.js/TypeScript** (mais rápido para MVP):
- **Framework**: Express.js ou Fastify
- **ORM**: Prisma
- **Cache**: Redis (para queries frequentes)
- **Validação**: Zod

### Frontend
**Recomendado**: React + TypeScript
- **UI Library**: shadcn/ui
- **Gráficos**: Recharts
- **Estado**: Zustand ou Context API
- **Data fetching**: TanStack Query (React Query)
- **Tabelas**: TanStack Table

### Database
- **PostgreSQL** (fornecido)
- **Views materializadas** para queries complexas
- **Indexes** otimizados

### Deploy
- **Backend**: Railway, Render, ou Fly.io (free tier)
- **Frontend**: Vercel ou Netlify
- **Database**: Railway ou Render (já tem PostgreSQL)

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────┐
│   Frontend      │ (React + Charts)
│   (Vercel)      │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│   Backend       │ (Node/Python)
│   (Railway)     │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼──┐   ┌──▼───┐
│Redis │   │ PG   │
│Cache │   │ DB   │
└──────┘   └──────┘
```

### Camadas

1. **API Layer**: Endpoints REST
   - `/api/dashboard/overview`
   - `/api/products/top`
   - `/api/sales/by-channel`
   - `/api/stores/comparison`
   - `/api/reports/[type]`

2. **Service Layer**: Lógica de negócio
   - `DashboardService`
   - `ProductAnalyticsService`
   - `SalesAnalyticsService`
   - `ReportService`

3. **Data Layer**: Acesso aos dados
   - Queries SQL otimizadas
   - Views materializadas
   - Cache Redis (TTL: 5-15min)

---

## 📊 Otimizações de Performance

### Database
```sql
-- Views materializadas para queries frequentes
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    store_id,
    channel_id,
    COUNT(*) as total_sales,
    SUM(total_amount) as revenue,
    AVG(total_amount) as avg_ticket
FROM sales
WHERE sale_status_desc = 'COMPLETED'
GROUP BY DATE(created_at), store_id, channel_id;

-- Refresh a cada 15 minutos (cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
```

### Indexes
```sql
CREATE INDEX idx_sales_date_status ON sales(DATE(created_at), sale_status_desc);
CREATE INDEX idx_sales_store_channel ON sales(store_id, channel_id);
CREATE INDEX idx_product_sales_product ON product_sales(product_id, sale_id);
```

### Cache Strategy
- **Dashboard overview**: 5min TTL
- **Top produtos**: 15min TTL
- **Dados históricos**: 1h TTL
- **Real-time data**: Bypass cache

---

## 🎯 Métricas de Sucesso do MVP

### Performance
- ✅ Dashboard carrega em < 2s
- ✅ Queries complexas retornam em < 1s
- ✅ Frontend responsivo (mobile + desktop)

### Usabilidade
- ✅ Maria consegue ver faturamento do dia em < 10s
- ✅ Maria consegue comparar lojas em < 30s
- ✅ Maria consegue exportar relatório em < 1min

### Funcionalidade
- ✅ 6 funcionalidades core implementadas
- ✅ Pelo menos 5 relatórios pré-configurados
- ✅ Filtros funcionando em todas as telas

---

## 🚀 Roadmap de Implementação (1 semana)

### Dia 1-2: Setup + Backend Core
- [ ] Setup projeto (repo, docker, env)
- [ ] Conectar ao PostgreSQL fornecido
- [ ] Criar views materializadas essenciais
- [ ] Implementar endpoints principais (/dashboard, /products, /sales)
- [ ] Setup Redis cache
- [ ] Testes básicos de performance

### Dia 3-4: Frontend Core
- [ ] Setup React + UI library
- [ ] Implementar Dashboard Overview
- [ ] Implementar Explorador de Produtos
- [ ] Implementar Análise de Canais
- [ ] Componentes de gráficos reutilizáveis

### Dia 5-6: Features + Polish
- [ ] Análise Temporal
- [ ] Performance de Lojas
- [ ] Relatórios pré-configurados
- [ ] Filtros globais
- [ ] Export para CSV/Excel
- [ ] Loading states + error handling
- [ ] Responsive design

### Dia 7: Deploy + Demo
- [ ] Deploy backend (Railway)
- [ ] Deploy frontend (Vercel)
- [ ] Testes end-to-end
- [ ] Gravar vídeo demo (5-10min)
- [ ] Documentação final
- [ ] README com instruções

---

## 🎓 Diferenciais Competitivos

### Must-Have (para passar)
- ✅ Interface intuitiva e funcional
- ✅ Queries performáticas (< 1s)
- ✅ Deploy funcional
- ✅ Código limpo e bem estruturado

### Nice-to-Have (para se destacar)
- 🌟 **Insights automáticos** com IA/ML
  - "Seu produto X está vendendo 40% menos esta semana"
  - "Horário Y tem potencial inexplorado"
  
- 🌟 **Comparações inteligentes**
  - "Você vs média de lojas similares"
  - "Seu crescimento vs tendência do setor"

- 🌟 **Alertas proativos**
  - Taxa de cancelamento subiu 20%
  - Tempo de entrega acima da média

- 🌟 **Export avançado**
  - PDF com branding
  - Agendamento de relatórios
  - Email automático

- 🌟 **Mobile-first**
  - PWA instalável
  - Notificações push

---

## 📝 Checklist Final

### Código
- [ ] Código TypeScript com types
- [ ] Testes unitários (pelo menos coverage > 50%)
- [ ] ESLint/Prettier configurado
- [ ] Sem erros de console

### Documentação
- [ ] README.md completo
- [ ] Decisões arquiteturais documentadas
- [ ] API documentada (Swagger/OpenAPI)
- [ ] Comentários em código complexo

### Deploy
- [ ] Backend deployado e acessível
- [ ] Frontend deployado e acessível
- [ ] Database em cloud ou local com instruções claras
- [ ] Variáveis de ambiente documentadas

### Demo
- [ ] Vídeo gravado (5-10min)
- [ ] Link do vídeo no README
- [ ] Demonstra todas funcionalidades core
- [ ] Explica decisões técnicas

---

## 💡 Dicas Finais

1. **Foque no problema**: Maria precisa de insights, não de gráficos bonitos
2. **Performance importa**: 500k registros precisam ser rápidos
3. **Simplicidade > Complexidade**: Melhor fazer 6 coisas bem que 20 mal feitas
4. **Documente decisões**: "Por que X e não Y?" é mais importante que o código
5. **Teste em produção**: Deploy real mostra comprometimento

---

## 📚 Recursos Úteis

### Inspirações de UX/UI
- [Metabase](https://www.metabase.com/) - Query builder intuitivo
- [Amplitude](https://amplitude.com/) - Analytics UX
- [Grafana](https://grafana.com/) - Dashboards flexíveis
- [Looker](https://looker.com/) - Business intelligence

### Libraries Recomendadas

#### Frontend
- [Recharts](https://recharts.org/) - Gráficos React simples
- [Apache ECharts](https://echarts.apache.org/) - Gráficos avançados
- [TanStack Table](https://tanstack.com/table) - Tabelas poderosas
- [shadcn/ui](https://ui.shadcn.com/) - Componentes modernos
- [date-fns](https://date-fns.org/) - Manipulação de datas

#### Backend
- [Prisma](https://www.prisma.io/) - ORM TypeScript
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [node-cache](https://www.npmjs.com/package/node-cache) - Cache em memória
- [ioredis](https://www.npmjs.com/package/ioredis) - Redis client

---

## 🔍 Exemplos de Queries Otimizadas

### Dashboard Overview
```sql
-- Métricas principais do período
SELECT 
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_ticket,
    SUM(CASE WHEN sale_status_desc = 'CANCELLED' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as cancel_rate
FROM sales
WHERE created_at BETWEEN $1 AND $2
    AND store_id = ANY($3)  -- array de lojas
    AND sale_status_desc IN ('COMPLETED', 'CANCELLED');
```

### Top Produtos
```sql
-- Top 10 produtos por receita
SELECT 
    p.name,
    c.name as category,
    COUNT(ps.id) as quantity_sold,
    SUM(ps.total_price) as revenue,
    AVG(ps.total_price) as avg_price
FROM product_sales ps
JOIN products p ON p.id = ps.product_id
JOIN categories c ON c.id = p.category_id
JOIN sales s ON s.id = ps.sale_id
WHERE s.created_at BETWEEN $1 AND $2
    AND s.sale_status_desc = 'COMPLETED'
    AND s.store_id = ANY($3)
GROUP BY p.id, p.name, c.name
ORDER BY revenue DESC
LIMIT 10;
```

### Vendas por Hora
```sql
-- Distribuição por hora do dia
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as sales_count,
    SUM(total_amount) as revenue
FROM sales
WHERE created_at BETWEEN $1 AND $2
    AND sale_status_desc = 'COMPLETED'
    AND store_id = ANY($3)
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;
```

### Comparação de Canais
```sql
-- Performance por canal
SELECT 
    ch.name as channel,
    ch.type,
    COUNT(s.id) as total_orders,
    SUM(s.total_amount) as revenue,
    AVG(s.total_amount) as avg_ticket,
    AVG(s.production_seconds / 60.0) as avg_prep_minutes,
    AVG(CASE WHEN s.delivery_seconds IS NOT NULL 
        THEN s.delivery_seconds / 60.0 END) as avg_delivery_minutes
FROM sales s
JOIN channels ch ON ch.id = s.channel_id
WHERE s.created_at BETWEEN $1 AND $2
    AND s.sale_status_desc = 'COMPLETED'
    AND s.store_id = ANY($3)
GROUP BY ch.id, ch.name, ch.type
ORDER BY revenue DESC;
```

---

## 🎯 Anti-Patterns a Evitar

### ❌ Não Fazer
- Buscar todos os dados e processar no frontend
- N+1 queries (fazer loop de queries)
- Sem paginação em listas grandes
- Cache infinito (sem invalidação)
- Queries sem indexes
- Frontend sem loading states
- Deploy sem variáveis de ambiente
- Código sem tipos (TypeScript/Python type hints)

### ✅ Fazer
- Agregação no banco de dados
- Queries otimizadas com JOINs
- Paginação e lazy loading
- Cache com TTL apropriado
- Indexes em colunas filtradas
- Loading skeletons e error boundaries
- Environment variables para config
- Type safety em toda aplicação

---

## 🌟 Ideias para V2 (Fora do Escopo do MVP)

### Features Avançadas
- **Previsão de demanda** com ML
- **Recomendação de preços** baseada em dados
- **Análise de sentimento** de avaliações
- **Detecção de fraudes** em pedidos
- **Otimização de rotas** de delivery
- **A/B testing** de promoções
- **Segmentação de clientes** automática
- **Chatbot** para queries em linguagem natural

### Integrações
- WhatsApp Business API (envio de relatórios)
- Google Sheets (sincronização)
- Sistemas de ERP
- Plataformas de delivery (API iFood, Rappi)
- Ferramentas de BI externas

### Funcionalidades Operacionais
- **Multi-tenant** (múltiplos restaurantes)
- **Permissões granulares** (gerente vs dono)
- **Auditoria** de ações
- **Agendamento** de relatórios
- **Webhooks** para eventos importantes
- **API pública** para integrações