# 📋 PLANO DE IMPLEMENTAÇÃO - FASE 1: Análise Financeira Aprofundada

**Status:** 🟡 Planejamento
**Prioridade:** 🔴 CRÍTICA
**Duração:** 15 dias úteis (3 semanas)
**Data de Início:** TBD
**Data de Conclusão Prevista:** TBD

---

## 🎯 Objetivo Geral

Transformar a plataforma Mise de um dashboard de vendas em um **sistema completo de gestão financeira** para restaurantes, fornecendo visibilidade total sobre custos, rentabilidade, DRE, Prime Cost, lucratividade por canal e break-even.

### Resultados Esperados
- ✅ Gestor calcula DRE completo em < 5 minutos
- ✅ Sistema identifica automaticamente canais deficitários
- ✅ Redução de 15-20% no CMV através de melhor controle
- ✅ Break-even tracking em tempo real
- ✅ Prime Cost mantido na faixa ideal (55-65%)

---

## 📦 Entregas da Fase 1

### 5 Módulos Principais

1. **Sistema de Gestão de Custos** - Cadastro e rastreamento de custos de produtos
2. **DRE Gerencial** - Demonstrativo de Resultados completo com visualizações
3. **Análise de CMV e Prime Cost** - Controle dos dois maiores custos variáveis
4. **Lucratividade por Canal** - Análise de rentabilidade real por canal de venda
5. **Break-Even Analysis** - Ponto de equilíbrio e projeções

---

## 🗓️ CRONOGRAMA DETALHADO

### **SEMANA 1: Fundação e Gestão de Custos** (Dias 1-5)

#### **DIA 1: Setup e Database Schema**
**Foco:** Estrutura de dados e migrations

**Backend**
- [ ] Criar branch `feature/phase1-financial-analysis`
- [ ] Adicionar 5 novos modelos ao Prisma schema:
  - [ ] `ProductCost` (custos de produtos com histórico)
  - [ ] `Supplier` (fornecedores)
  - [ ] `OperatingExpense` (despesas operacionais)
  - [ ] `FixedCost` (custos fixos)
  - [ ] `ChannelCommission` (comissões por canal)
- [ ] Criar migrations: `npx prisma migrate dev --name add-financial-models`
- [ ] Atualizar relações nos modelos existentes (Store, Product, Channel)
- [ ] Criar seeds para dados de teste:
  - [ ] 50 custos de produtos
  - [ ] 5 fornecedores
  - [ ] 10 despesas operacionais
  - [ ] 3 custos fixos por loja
  - [ ] Comissões para iFood, Rappi, etc

**Estimativa:** 6-8 horas
**Bloqueadores:** Nenhum
**Dependências:** Schema Prisma existente

---

#### **DIA 2: Services Layer - Cost Management**
**Foco:** Lógica de negócio para gestão de custos

**Backend**
- [ ] Criar `backend/src/services/CostService.ts`:
  - [ ] `calculateCOGS(storeId, startDate, endDate)` - Calcula CMV
  - [ ] `calculatePrimeCost(storeId, startDate, endDate)` - CMV + Mão de obra
  - [ ] `getCostHistory(productId)` - Histórico de custos
  - [ ] `getPrimeCostStatus(percentage)` - Valida se está saudável
  - [ ] `getCostsByCategory(storeId, period)` - CMV por categoria

- [ ] Criar `backend/src/services/SupplierService.ts`:
  - [ ] CRUD básico de fornecedores
  - [ ] `getProductsBySupplierId(supplierId)`

- [ ] Implementar caching com Redis (TTL: 30 min para custos)

**Testes**
- [ ] Testes unitários para `CostService`
- [ ] Testar cálculo de CMV com dados mockados
- [ ] Testar Prime Cost com diferentes cenários

**Estimativa:** 6-8 horas
**Bloqueadores:** Migrations do Dia 1
**Dependências:** Database schema

---

#### **DIA 3: API Endpoints - Cost Management**
**Foco:** Endpoints REST para gestão de custos

**Backend**
- [ ] Criar `backend/src/controllers/CostController.ts`
- [ ] Implementar endpoints:
  ```
  POST   /api/costs/products              - Criar custo
  GET    /api/costs/products/:id          - Obter custo atual
  GET    /api/costs/products/:id/history  - Histórico
  PUT    /api/costs/products/:id          - Atualizar
  DELETE /api/costs/products/:id          - Remover
  POST   /api/costs/products/bulk         - Import em massa
  ```

- [ ] Criar `backend/src/controllers/SupplierController.ts`
- [ ] Implementar endpoints:
  ```
  GET    /api/suppliers                   - Listar
  POST   /api/suppliers                   - Criar
  PUT    /api/suppliers/:id               - Atualizar
  DELETE /api/suppliers/:id               - Remover
  GET    /api/suppliers/:id/products      - Produtos do fornecedor
  ```

- [ ] Adicionar validações (Zod schemas)
- [ ] Implementar middleware de autenticação
- [ ] Adicionar rate limiting

**Testes**
- [ ] Testes de integração para todos os endpoints
- [ ] Testar validações de input
- [ ] Testar permissões e autenticação

**Estimativa:** 6-8 horas
**Bloqueadores:** Services do Dia 2
**Dependências:** CostService, SupplierService

---

#### **DIA 4: Frontend - Cost Management UI (Parte 1)**
**Foco:** Componentes de interface para custos

**Frontend**
- [ ] Criar página `/dashboard/financial/costs`
- [ ] Estrutura de layout com tabs:
  - Tab 1: Cadastro de Custos
  - Tab 2: Histórico
  - Tab 3: Fornecedores

**Componente: CostInputForm.tsx**
- [ ] Criar formulário com React Hook Form + Zod
- [ ] Campos:
  - [ ] Autocomplete de produtos (com search)
  - [ ] Input de custo (R$)
  - [ ] Date picker (validFrom/validUntil)
  - [ ] Select de fornecedor (opcional)
  - [ ] Textarea de notas
- [ ] Validações client-side
- [ ] Feedback visual (toast notifications)
- [ ] Loading states

**Componente: SupplierManager.tsx**
- [ ] Modal de criação de fornecedor
- [ ] Lista de fornecedores com busca
- [ ] Botões de editar/deletar

**Estimativa:** 6-8 horas
**Bloqueadores:** API endpoints do Dia 3
**Dependências:** API /costs, /suppliers

---

#### **DIA 5: Frontend - Cost Management UI (Parte 2)**
**Foco:** Histórico, gráficos e import

**Frontend**

**Componente: CostHistoryTable.tsx**
- [ ] Tabela com TanStack Table v8
- [ ] Colunas: Data, Produto, Custo Anterior, Custo Novo, Variação %, Fornecedor
- [ ] Filtros:
  - [ ] Por produto (autocomplete)
  - [ ] Por período (date range picker)
  - [ ] Por fornecedor
- [ ] Paginação server-side (50 itens/página)
- [ ] Ordenação por coluna
- [ ] Export para CSV e Excel (biblioteca: xlsx)

**Componente: CostTrendChart.tsx**
- [ ] Line Chart usando Recharts
- [ ] Eixo X: Meses (últimos 12)
- [ ] Eixo Y: Custo médio (R$)
- [ ] Múltiplas linhas (produtos selecionáveis)
- [ ] Tooltip customizado
- [ ] Responsivo

**Componente: BulkCostImport.tsx**
- [ ] Upload de arquivo (drag & drop)
- [ ] Suporte CSV e Excel
- [ ] Preview dos dados antes de salvar
- [ ] Validação de formato
- [ ] Feedback de erros linha por linha
- [ ] Template de exemplo para download

**Integração**
- [ ] Conectar todos os componentes à API
- [ ] Implementar React Query para cache
- [ ] Loading skeletons
- [ ] Error boundaries

**Estimativa:** 8 horas
**Bloqueadores:** Componentes do Dia 4
**Dependências:** API completa, Recharts instalado

---

### **SEMANA 2: DRE e Lucratividade por Canal** (Dias 6-10)

#### **DIA 6: DRE Backend - Services e Cálculos**
**Foco:** Lógica de cálculo do DRE

**Backend**

**Criar FinancialService.ts**
- [ ] `generateDRE(storeId, startDate, endDate)`:
  - [ ] Calcular Receita Bruta (sum de sales)
  - [ ] Calcular Deduções (descontos, cancelamentos)
  - [ ] Receita Líquida = Bruta - Deduções
  - [ ] Calcular CMV (usar CostService)
  - [ ] Lucro Bruto = Receita Líquida - CMV
  - [ ] Buscar Despesas Operacionais
  - [ ] Lucro Operacional = Lucro Bruto - Despesas
  - [ ] Calcular Comissões de Canais
  - [ ] Lucro Líquido = Lucro Op. - Comissões
  - [ ] Calcular Prime Cost
  - [ ] Retornar estrutura completa do DRE

- [ ] `compareDRE(period1, period2)` - Comparação entre períodos
- [ ] `getOperatingExpenses(storeId, period, category?)` - Despesas

**Criar ExpenseService.ts**
- [ ] CRUD de despesas operacionais
- [ ] `getSummaryByCategory(storeId, period)` - Resumo por categoria

**Cache Strategy**
- [ ] Implementar cache Redis (TTL: 15 min)
- [ ] Cache key pattern: `financial:dre:{storeId}:{period}`

**Testes**
- [ ] Testes unitários de cálculos
- [ ] Testar DRE com diferentes cenários
- [ ] Validar fórmulas financeiras

**Estimativa:** 8 horas
**Bloqueadores:** CostService funcional
**Dependências:** Dados de vendas, CostService

---

#### **DIA 7: DRE Backend - API Endpoints**
**Foco:** Endpoints REST para DRE

**Backend**

**Criar FinancialController.ts**
- [ ] Endpoints:
  ```
  GET /api/financial/dre
    Query: storeId, startDate, endDate, period
    Response: DRE completo com todas as linhas

  GET /api/financial/dre/compare
    Query: storeId, period1Start, period1End, period2Start, period2End
    Response: { current, comparison, variance }
  ```

**Criar ExpenseController.ts**
- [ ] Endpoints:
  ```
  GET    /api/expenses/operating          - Listar despesas
  POST   /api/expenses/operating          - Criar despesa
  PUT    /api/expenses/operating/:id      - Atualizar
  DELETE /api/expenses/operating/:id      - Deletar
  GET    /api/expenses/operating/summary  - Resumo por categoria
  ```

**Criar FixedCostController.ts**
- [ ] Endpoints:
  ```
  GET    /api/costs/fixed                 - Listar custos fixos
  POST   /api/costs/fixed                 - Criar
  PUT    /api/costs/fixed/:id             - Atualizar
  DELETE /api/costs/fixed/:id             - Deletar
  ```

**Validações**
- [ ] Schemas Zod para todos os endpoints
- [ ] Validar períodos de data
- [ ] Validar valores positivos

**Testes**
- [ ] Testes de integração para DRE
- [ ] Testar comparação de períodos
- [ ] Testar cálculos com dados reais

**Estimativa:** 6-8 horas
**Bloqueadores:** FinancialService do Dia 6
**Dependências:** FinancialService, ExpenseService

---

#### **DIA 8: Frontend DRE - Página e KPI Cards**
**Foco:** Interface do DRE

**Frontend**

**Criar página: /dashboard/financial/dre**

**Componente: DREDashboard.tsx**
- [ ] Layout principal da página
- [ ] Period selector (date range)
- [ ] Botão de comparação de períodos
- [ ] Botão de export (PDF/Excel)

**Componente: DREKPICards.tsx**
- [ ] 4 KPI cards no topo:
  - [ ] Lucro Líquido (com trend)
  - [ ] Margem Líquida % (com trend)
  - [ ] Lucro Bruto (com trend)
  - [ ] Prime Cost % (com status: saudável/atenção/crítico)
- [ ] Indicadores de variação vs período anterior
- [ ] Ícones e cores por status
- [ ] Animações de entrada

**Componente: DRETable.tsx**
- [ ] Tabela hierárquica do DRE
- [ ] Estrutura com 11 níveis:
  - Receita Bruta (com breakdown por canal)
  - Deduções
  - Receita Líquida
  - CMV (com breakdown por categoria)
  - Lucro Bruto
  - Despesas Operacionais (com breakdown)
  - Lucro Operacional
  - Comissões (com breakdown por canal)
  - Lucro Líquido
  - Prime Cost
- [ ] Coluna de valores (R$)
- [ ] Coluna de % da receita
- [ ] Drill-down expansível (accordion)
- [ ] Linhas de total destacadas
- [ ] Export para Excel

**Estimativa:** 8 horas
**Bloqueadores:** API /financial/dre
**Dependências:** API DRE completa

---

#### **DIA 9: Frontend DRE - Waterfall Chart**
**Foco:** Visualização cascata do DRE

**Frontend**

**Componente: WaterfallChart.tsx**
- [ ] Implementar Waterfall Chart com Recharts
- [ ] Configuração:
  - [ ] Eixo X: Categorias (Receita Bruta, CMV, etc)
  - [ ] Eixo Y: Valores (R$)
  - [ ] Barras coloridas por tipo:
    - Verde (#10b981): Positivo/Receita
    - Vermelho (#ef4444): Negativo/Custos
    - Azul (#3b82f6): Totais
  - [ ] Conectores (linhas tracejadas) entre barras
  - [ ] Labels com valores em cada barra

- [ ] Tooltip customizado:
  - [ ] Nome da categoria
  - [ ] Valor (R$)
  - [ ] % da receita
  - [ ] Variação vs período anterior

- [ ] Animação de entrada sequencial (cascade effect)
- [ ] Responsivo (barras horizontais em mobile)

**Componente: DREComparisonView.tsx**
- [ ] Layout side-by-side de 2 períodos
- [ ] Highlighting de variações
- [ ] Gráfico de barras de variação

**Integração**
- [ ] Conectar à API
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

**Estimativa:** 8 horas
**Bloqueadores:** DRETable do Dia 8
**Dependências:** Recharts, API DRE

---

#### **DIA 10: Lucratividade por Canal**
**Foco:** Análise de rentabilidade por canal

**Backend**

**Criar ChannelProfitabilityService.ts**
- [ ] `analyzeChannelProfitability(storeId, startDate, endDate)`:
  - [ ] Para cada canal:
    - [ ] Calcular Receita Bruta
    - [ ] Buscar taxa de comissão
    - [ ] Calcular Comissões pagas
    - [ ] Receita Líquida = Bruta - Comissões
    - [ ] Calcular CMV do canal
    - [ ] Margem de Contribuição = Líquida - CMV
    - [ ] Taxa de Margem = (Margem / Bruta) * 100
    - [ ] Métricas por pedido (avgTicket, profitPerOrder)
  - [ ] Gerar insights automáticos:
    - [ ] Identificar canal com alta receita mas baixa margem
    - [ ] Sugerir oportunidades de migração
    - [ ] Alertar sobre canais deficitários

**API Endpoint**
- [ ] `GET /api/financial/channel-profitability`
- [ ] Query: storeId, startDate, endDate
- [ ] Response: array de canais + insights

**Frontend**

**Criar página: /dashboard/financial/channel-profitability**

**Componente: GroupedBarChart.tsx**
- [ ] Barras agrupadas (Recharts)
- [ ] 3 barras por canal:
  - Receita Bruta (azul)
  - Receita Líquida (verde)
  - Margem Contribuição (roxo)
- [ ] Legenda horizontal
- [ ] Tooltip detalhado
- [ ] Responsivo

**Componente: ChannelProfitabilityTable.tsx**
- [ ] Tabela com 8 colunas:
  - Canal, Pedidos, Receita Bruta, Comissão (Taxa),
  - Receita Líquida, CMV, Margem Contrib., Lucro/Pedido
- [ ] Linhas coloridas por performance
- [ ] Sorting por coluna

**Componente: InsightsPanel.tsx**
- [ ] Card de insights automáticos
- [ ] Ícones por tipo (warning/opportunity/info)
- [ ] Ações sugeridas

**Estimativa:** 8 horas
**Bloqueadores:** API de canais existente
**Dependências:** CostService, Sales data

---

### **SEMANA 3: Prime Cost e Break-Even** (Dias 11-15)

#### **DIA 11: Prime Cost - Backend e Gauge Chart**
**Foco:** Análise de Prime Cost

**Backend**
- [ ] Endpoints já implementados em CostService
- [ ] Validar cálculos de Prime Cost
- [ ] Implementar alertas automáticos quando > 65%

**Frontend**

**Criar página: /dashboard/financial/prime-cost**

**Componente: GaugeChart.tsx**
- [ ] Semi-círculo com ponteiro
- [ ] Biblioteca: Recharts RadialBarChart
- [ ] 5 faixas de cores:
  - 0-55%: Verde escuro - Excelente
  - 55-60%: Verde claro - Ótimo
  - 60-65%: Amarelo - Saudável
  - 65-70%: Laranja - Atenção
  - 70%+: Vermelho - Crítico
- [ ] Valor central grande e bold
- [ ] Status textual ("Saudável")
- [ ] Animação suave do ponteiro

**Componente: DonutCharts.tsx**
- [ ] 2 gráficos de rosca lado a lado:
  - Composição CMV (por categoria)
  - Composição Prime Cost (CMV vs Mão de Obra)
- [ ] innerRadius: 60%
- [ ] Cores: degradê azul → roxo
- [ ] Label central com valor total
- [ ] Legenda abaixo

**Estimativa:** 6-8 horas
**Bloqueadores:** CostService
**Dependências:** Recharts

---

#### **DIA 12: Prime Cost - Trend Line e Tabela**
**Foco:** Histórico e detalhamento

**Frontend**

**Componente: PrimeCostTrendLine.tsx**
- [ ] Line Chart (Recharts)
- [ ] Eixo X: Últimos 12 meses
- [ ] Eixo Y: Percentual (0-100%)
- [ ] Linhas:
  - Prime Cost atual (azul, 3px)
  - Benchmark 60% (cinza tracejado)
  - Zona saudável 55-65% (área verde transparente)
- [ ] Tooltip com:
  - % Prime Cost
  - Valor R$ absoluto
  - Status (saudável/atenção/crítico)
- [ ] Responsivo
- [ ] Altura: 350px

**Componente: CMVCategoryTable.tsx**
- [ ] Tabela drill-down interativa
- [ ] Colunas:
  - Categoria
  - CMV (R$)
  - % do CMV total
  - % da Venda
  - Tendência (vs mês anterior)
- [ ] Hierarquia expansível (ex: Proteínas → Carne, Frango, Peixe)
- [ ] Ícones de tendência (↑↓→)
- [ ] Sorting
- [ ] Alertas inline (custo aumentou > 10%)

**Componente: PrimeCostInsights.tsx**
- [ ] Painel de insights:
  - Status atual
  - Categorias problemáticas
  - Sugestões de ação

**Estimativa:** 6-8 horas
**Bloqueadores:** Gauge e Donuts do Dia 11
**Dependências:** API CMV por categoria

---

#### **DIA 13: Break-Even - Backend e Cálculos**
**Foco:** Ponto de equilíbrio

**Backend**

**Criar BreakEvenService.ts**
- [ ] `calculate(storeId, period, fixedCosts, variableCostRate)`:
  - [ ] Calcular Margem de Contribuição % = 100 - variableCostRate
  - [ ] Break-Even Revenue = fixedCosts / (contributionMarginRate / 100)
  - [ ] Break-Even Units (pedidos) = breakEvenRevenue / avgTicket
  - [ ] Retornar estrutura completa

- [ ] `getProgress(storeId, period)`:
  - [ ] Calcular break-even
  - [ ] Buscar receita atual no período
  - [ ] Progress % = (currentRevenue / breakEvenRevenue) * 100
  - [ ] Remaining = breakEvenRevenue - currentRevenue
  - [ ] Estimar data de atingimento (baseado em média diária)
  - [ ] Gerar projeções: pessimista, realista, otimista

- [ ] `getDailyProgress(storeId, period)`:
  - [ ] Receita acumulada dia a dia
  - [ ] Para gráfico de progresso diário

**API Endpoints**
- [ ] `POST /api/financial/break-even/calculate`
- [ ] `GET /api/financial/break-even/progress`

**Testes**
- [ ] Validar fórmulas matemáticas
- [ ] Testar diferentes cenários
- [ ] Testar projeções

**Estimativa:** 6 horas
**Bloqueadores:** FixedCost model
**Dependências:** Sales data, CostService

---

#### **DIA 14: Break-Even - Frontend (Parte 1)**
**Foco:** Gráficos principais

**Frontend**

**Criar página: /dashboard/financial/break-even**

**Componente: BreakEvenKPICards.tsx**
- [ ] 4 cards:
  - Break-Even (R$/mês + pedidos necessários)
  - Progresso (% + barra visual)
  - Falta (R$ restante ou "Atingido!")
  - Previsão (data estimada)
- [ ] Animações
- [ ] Status colors

**Componente: BreakEvenChart.tsx**
- [ ] Line Chart clássico (Recharts)
- [ ] Eixo X: Receita (R$ 0 a max)
- [ ] Eixo Y: Custos/Receita (R$)
- [ ] 3 linhas:
  - Custo Total (vermelho): começa em fixos, cresce linear
  - Receita Total (verde): começa em 0, cresce linear
  - Custos Fixos (cinza tracejado): horizontal
- [ ] Ponto de interseção destacado (círculo + label)
- [ ] Áreas preenchidas:
  - Prejuízo (vermelho transparente): abaixo break-even
  - Lucro (verde transparente): acima break-even
- [ ] Linha vertical da posição atual (azul tracejado)
- [ ] Altura: 400px

**Componente: ProgressBar.tsx**
- [ ] Barra horizontal customizada
- [ ] Largura: 100%
- [ ] Altura: 80px
- [ ] Segmentos:
  - 0-100%: Gradient azul → verde
  - 100%+: Verde sólido
- [ ] Marcadores: 25%, 50%, 75%, 100%
- [ ] Animação de preenchimento (2s)
- [ ] Labels informativos

**Estimativa:** 8 horas
**Bloqueadores:** API break-even do Dia 13
**Dependências:** BreakEvenService

---

#### **DIA 15: Break-Even - Frontend (Parte 2) e Finalização**
**Foco:** Completar break-even e polish geral

**Frontend**

**Componente: DailyProgressChart.tsx**
- [ ] Area Chart (Recharts)
- [ ] Eixo X: Dias do mês (1-31)
- [ ] Eixo Y: Receita acumulada (R$)
- [ ] 3 áreas:
  - Receita Real (azul sólido)
  - Projeção Otimista (azul transparente tracejado)
  - Projeção Realista (azul transparente tracejado)
- [ ] Linha de referência: Break-even (vermelho horizontal tracejado)
- [ ] Tooltip:
  - Receita do dia
  - Receita acumulada
  - % do break-even
- [ ] Marker na data atual
- [ ] Altura: 350px

**Componente: SensitivityAnalysisTable.tsx**
- [ ] Tabela de cenários "E se...?"
- [ ] 5 cenários:
  - Mínimo Viável (break-even exato)
  - Conservador (+33%)
  - Realista (+67%)
  - Otimista (+100%)
  - Atual (posição real)
- [ ] Colunas:
  - Cenário
  - Receita Necessária
  - Resultado Líquido
  - Status (emoji + texto)
- [ ] Seção de insights:
  - "Para aumentar R$ X no lucro, você precisa de..."
  - 3 opções: aumentar receita / reduzir custos fixos / melhorar margem

**Polish Geral da Fase 1**
- [ ] Revisar todos os componentes
- [ ] Consistência de design
- [ ] Ajustes de responsividade
- [ ] Loading states em todos os componentes
- [ ] Error boundaries
- [ ] Empty states
- [ ] Validações de formulários
- [ ] Feedback toast/notifications
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization (lazy loading, code splitting)

**Documentação**
- [ ] Comentários nos componentes principais
- [ ] README de como usar a seção financeira
- [ ] Help tooltips na interface
- [ ] Guia rápido (onboarding)

**Testes Finais**
- [ ] Testes E2E do fluxo completo
- [ ] Testar com dados reais de produção
- [ ] Cross-browser testing
- [ ] Mobile testing

**Estimativa:** 8 horas
**Bloqueadores:** Componentes anteriores
**Dependências:** Todas as APIs funcionais

---

## 📚 Bibliotecas e Dependências

### Backend
```bash
# Já instaladas
prisma
@prisma/client
express
redis
zod

# Verificar versões
```

### Frontend
```bash
# Instalar
npm install recharts
npm install @tanstack/react-table
npm install react-hook-form
npm install zod
npm install date-fns
npm install xlsx
npm install react-dropzone

# Para gráficos avançados (opcional)
npm install victory  # Se Recharts não atender gauge charts
```

---

## 🧪 Estratégia de Testes

### Backend
- **Unit Tests:** Services (Jest)
  - [ ] CostService
  - [ ] FinancialService
  - [ ] BreakEvenService
  - [ ] ChannelProfitabilityService

- **Integration Tests:** API endpoints
  - [ ] Todos os endpoints de custos
  - [ ] Endpoints de DRE
  - [ ] Endpoints de break-even
  - [ ] Endpoints de despesas

- **Coverage Goal:** > 80%

### Frontend
- **Component Tests:** (Vitest + Testing Library)
  - [ ] Formulários (validação)
  - [ ] Tabelas (sorting, filtering)
  - [ ] Gráficos (renderização)

- **E2E Tests:** (Playwright)
  - [ ] Fluxo completo: cadastrar custo → ver no histórico
  - [ ] Fluxo completo: cadastrar despesa → ver no DRE
  - [ ] Fluxo completo: visualizar break-even

---

## 🚀 Deployment e Rollout

### Pré-Deploy
- [ ] Merge da branch `feature/phase1-financial-analysis` → `develop`
- [ ] Code review completo
- [ ] Aprovação de QA
- [ ] Rodar migrations em staging
- [ ] Testar em staging com dados de produção (cópia)

### Deploy
- [ ] Deploy backend (migrations primeiro)
- [ ] Deploy frontend
- [ ] Validar integração
- [ ] Smoke tests em produção

### Post-Deploy
- [ ] Monitorar logs por 24h
- [ ] Monitorar performance (response times)
- [ ] Monitorar erros (Sentry)
- [ ] Coletar feedback dos primeiros usuários
- [ ] Criar hotfix branch se necessário

---

## 📊 Métricas de Sucesso

### Técnicas (Semana 1 após deploy)
- [ ] Tempo de carregamento DRE < 3s (p95)
- [ ] Cache hit rate > 80%
- [ ] API response time p95 < 500ms
- [ ] Zero erros críticos em produção
- [ ] Uptime > 99.5%

### Produto (Mês 1 após deploy)
- [ ] 80%+ dos gestores acessam seção financeira semanalmente
- [ ] Custos cadastrados para 70%+ dos produtos
- [ ] 5+ DREs gerados por loja/mês
- [ ] 3+ insights acionados por loja/mês
- [ ] NPS da feature > 8

### Negócio (3 meses após deploy)
- [ ] Redução de 10-15% no CMV médio dos clientes ativos
- [ ] Identificação de R$ 5k-10k/mês em oportunidades por loja
- [ ] Melhoria de 3-5pp na margem líquida média
- [ ] 50%+ das lojas com Prime Cost na faixa ideal

---

## ⚠️ Riscos e Mitigações

### Risco 1: Dados de custos incompletos
**Impacto:** Alto - Cálculos incorretos
**Probabilidade:** Alta
**Mitigação:**
- [ ] Implementar validações rigorosas
- [ ] Alertar quando dados faltam
- [ ] Fornecer valores default sugeridos
- [ ] Onboarding guiado para cadastro inicial

### Risco 2: Performance com grande volume de dados
**Impacto:** Médio - Lentidão
**Probabilidade:** Média
**Mitigação:**
- [ ] Implementar caching agressivo
- [ ] Paginação em todas as listas
- [ ] Índices no banco otimizados
- [ ] Query optimization
- [ ] Lazy loading de gráficos

### Risco 3: Complexidade da UX
**Impacto:** Alto - Baixa adoção
**Probabilidade:** Média
**Mitigação:**
- [ ] Onboarding step-by-step
- [ ] Help tooltips em todos os campos
- [ ] Vídeos tutoriais
- [ ] Dashboard simplificado vs avançado
- [ ] Testes de usabilidade

### Risco 4: Fórmulas financeiras incorretas
**Impacto:** Crítico - Perda de confiança
**Probabilidade:** Baixa
**Mitigação:**
- [ ] Revisão por contador/consultor financeiro
- [ ] Testes com casos reais conhecidos
- [ ] Comparação com planilhas de clientes
- [ ] Documentação das fórmulas
- [ ] Unit tests exaustivos

---

## 📋 Checklist Final

### Antes de Começar
- [ ] Revisar spec completa da Fase 1
- [ ] Configurar ambiente de desenvolvimento
- [ ] Instalar todas as dependências
- [ ] Criar branch de feature
- [ ] Configurar Jira/Linear com tasks

### Durante Desenvolvimento
- [ ] Daily standups
- [ ] Code reviews diárias
- [ ] Testes contínuos
- [ ] Documentação inline
- [ ] Commits semânticos

### Antes de Deployar
- [ ] Todos os testes passando (✅ 100%)
- [ ] Coverage > 80%
- [ ] Code review aprovado
- [ ] QA sign-off
- [ ] Documentação completa
- [ ] Migrations testadas
- [ ] Rollback plan definido

### Após Deploy
- [ ] Smoke tests em produção ✅
- [ ] Monitoramento ativo 24h
- [ ] Coletar feedback
- [ ] Criar tickets de ajustes
- [ ] Documentar lições aprendidas

---

## 🎯 Próximos Passos (Pós-Fase 1)

Após completar a Fase 1 com sucesso:

1. **Fase 2: Engenharia de Cardápio** (2 semanas)
   - Matriz de Menu Engineering
   - Market Basket Analysis
   - Otimização de precificação

2. **Fase 3: Inteligência de Cliente** (2 semanas)
   - CRM básico
   - Segmentação RFM
   - Lifetime Value
   - Campanhas de retenção

3. **Fase 4: Analytics Preditivos** (3 semanas)
   - Forecasting de demanda
   - Recomendações com IA
   - Alertas inteligentes
   - Automações

---

## 📞 Contatos e Responsabilidades

**Tech Lead:** TBD
**Backend Lead:** TBD
**Frontend Lead:** TBD
**QA Lead:** TBD
**Product Owner:** TBD

**Reuniões:**
- Daily Standup: 9h30 (15 min)
- Planning Semanal: Segunda, 10h (1h)
- Review Semanal: Sexta, 16h (1h)
- Retrospectiva: Final da Fase 1 (1h)

---

**Status:** 🟡 Planejamento → Aguardando aprovação para iniciar
**Última Atualização:** [Data]
**Próxima Revisão:** [Data]

---

## 📝 Notas Adicionais

### Decisões Técnicas
- **ORM:** Prisma (já em uso, boa performance)
- **Cache:** Redis (TTL variável por tipo de dado)
- **Gráficos:** Recharts (leve, flexível, TypeScript)
- **Formulários:** React Hook Form + Zod (performance e validação)
- **Tabelas:** TanStack Table v8 (flexível, server-side)
- **State:** Zustand (já em uso no projeto)
- **Queries:** React Query (cache inteligente)

### Convenções de Código
- **Commits:** Conventional Commits (feat, fix, docs, etc)
- **Branches:** `feature/phase1-{module-name}`
- **PRs:** Template obrigatório, 2+ aprovadores
- **Tests:** Co-located com componentes
- **Styles:** Tailwind CSS (já em uso)

### Definition of Done
Uma tarefa está "Done" quando:
- [ ] Código implementado e funcional
- [ ] Testes unitários escritos e passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Sem warnings/errors no console
- [ ] Responsivo (mobile + desktop)
- [ ] Acessível (WCAG AA)
- [ ] Performance validada
- [ ] Merged na branch de feature

---

**🚀 Let's build an amazing financial analytics system!**
