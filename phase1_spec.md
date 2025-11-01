# FASE 1: Análise Financeira Aprofundada

**Prioridade:** CRÍTICA
**Duração Estimada:** 2-3 semanas
**Objetivo:** Transformar a plataforma Mise em um sistema completo de gestão financeira para restaurantes, fornecendo aos gestores visibilidade total sobre custos, rentabilidade e saúde financeira do negócio.

---

## 📊 Visão Geral

A Fase 1 expande o MVP existente com um módulo completo de **Análise Financeira**, indo além de métricas de receita para revelar onde o dinheiro é efetivamente ganho e perdido. Esta fase é fundamental porque:

- **80% dos restaurantes falham** nos primeiros 5 anos, principalmente por má gestão financeira
- Gestores frequentemente confundem **faturamento alto com lucratividade**
- Canais de delivery podem representar 40% da receita mas **apenas 10% do lucro** devido a comissões
- **CMV descontrolado** pode consumir margens sem que o gestor perceba

### Métricas de Sucesso

- [ ] Gestor consegue calcular DRE completo em < 5 minutos
- [ ] Sistema identifica automaticamente canais deficitários
- [ ] Redução de 15-20% no CMV através de melhor controle de custos
- [ ] Break-even tracking em tempo real
- [ ] Prime Cost mantido na faixa ideal (55-65%)

---

## 🎯 Módulos da Fase 1

### 1. Sistema de Gestão de Custos

#### 1.1 Objetivo
Permitir o cadastro, rastreamento e análise histórica dos custos de produtos, transformando dados brutos em inteligência sobre lucratividade real.

#### 1.2 Alterações no Backend

**Novos Modelos Prisma:**

```prisma
model ProductCost {
  id         Int      @id @default(autoincrement())
  productId  Int
  product    Product  @relation(fields: [productId], references: [id])
  cost       Decimal  @db.Decimal(10, 2)
  validFrom  DateTime @default(now())
  validUntil DateTime?
  supplierId Int?
  supplier   Supplier? @relation(fields: [supplierId], references: [id])
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([productId, validFrom])
  @@index([supplierId])
}

model Supplier {
  id           Int           @id @default(autoincrement())
  name         String
  contact      String?
  email        String?
  phone        String?
  productCosts ProductCost[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model OperatingExpense {
  id          Int      @id @default(autoincrement())
  storeId     Int
  store       Store    @relation(fields: [storeId], references: [id])
  category    String   // 'rent', 'labor', 'utilities', 'marketing', 'maintenance', 'other'
  amount      Decimal  @db.Decimal(10, 2)
  period      DateTime // Data de referência (ex: 2025-10-01 para despesas de outubro)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([storeId, period])
  @@index([category])
}

model FixedCost {
  id          Int      @id @default(autoincrement())
  storeId     Int
  store       Store    @relation(fields: [storeId], references: [id])
  name        String   // 'Aluguel', 'Salários Fixos', etc
  amount      Decimal  @db.Decimal(10, 2)
  frequency   String   // 'monthly', 'quarterly', 'annual'
  startDate   DateTime
  endDate     DateTime?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([storeId, startDate])
}

model ChannelCommission {
  id             Int      @id @default(autoincrement())
  channelId      Int
  channel        Channel  @relation(fields: [channelId], references: [id])
  commissionRate Decimal  @db.Decimal(5, 2) // Ex: 25.50 para 25.5%
  validFrom      DateTime @default(now())
  validUntil     DateTime?
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([channelId, validFrom])
}
```

**Novos Endpoints API:**

```typescript
// Gestão de Custos de Produtos
POST   /api/costs/products              // Criar/atualizar custo de produto
GET    /api/costs/products/:id          // Obter custo atual de um produto
GET    /api/costs/products/:id/history  // Histórico de custos
PUT    /api/costs/products/:id          // Atualizar custo
DELETE /api/costs/products/:id          // Remover custo
POST   /api/costs/products/bulk         // Import em massa (CSV/Excel)

// Fornecedores
GET    /api/suppliers                   // Listar fornecedores
POST   /api/suppliers                   // Criar fornecedor
PUT    /api/suppliers/:id               // Atualizar fornecedor
DELETE /api/suppliers/:id               // Remover fornecedor
GET    /api/suppliers/:id/products      // Produtos de um fornecedor

// Despesas Operacionais
GET    /api/expenses/operating          // Listar despesas (filtro por store, período, categoria)
POST   /api/expenses/operating          // Registrar despesa
PUT    /api/expenses/operating/:id      // Atualizar despesa
DELETE /api/expenses/operating/:id      // Remover despesa
GET    /api/expenses/operating/summary  // Resumo por categoria e período

// Custos Fixos
GET    /api/costs/fixed                 // Listar custos fixos
POST   /api/costs/fixed                 // Criar custo fixo
PUT    /api/costs/fixed/:id             // Atualizar custo fixo
DELETE /api/costs/fixed/:id             // Remover custo fixo

// Comissões de Canal
GET    /api/channels/commissions        // Listar comissões
POST   /api/channels/commissions        // Criar/atualizar comissão
PUT    /api/channels/commissions/:id    // Atualizar comissão
```

**Lógica de Negócio - Service Layer:**

```typescript
// backend/src/services/CostService.ts
class CostService {
  // Calcula CMV para um período específico
  async calculateCOGS(storeId: number, startDate: Date, endDate: Date) {
    // 1. Buscar todas as vendas do período
    // 2. Para cada produto vendido, buscar o custo válido na data da venda
    // 3. Multiplicar quantidade * custo
    // 4. Somar todos os custos
    // Retorna: { total, byCategory, byProduct, trends }
  }

  // Calcula Prime Cost (CMV + Mão de Obra)
  async calculatePrimeCost(storeId: number, startDate: Date, endDate: Date) {
    const cogs = await this.calculateCOGS(storeId, startDate, endDate);
    const laborCosts = await this.getOperatingExpenses(storeId, startDate, endDate, 'labor');
    const revenue = await this.getRevenue(storeId, startDate, endDate);

    return {
      cogs: cogs.total,
      labor: laborCosts,
      primeCost: cogs.total + laborCosts,
      primeCostPercentage: ((cogs.total + laborCosts) / revenue) * 100,
      status: this.getPrimeCostStatus(primeCostPercentage) // 'healthy', 'warning', 'critical'
    };
  }

  // Valida se Prime Cost está na faixa ideal
  getPrimeCostStatus(percentage: number) {
    if (percentage <= 60) return 'healthy';
    if (percentage <= 68) return 'warning';
    return 'critical';
  }
}
```

#### 1.3 Alterações no Frontend

**Nova Página:** `/dashboard/financial/costs`

**Componentes:**

1. **CostInputForm.tsx** - Formulário de cadastro de custos
   - Autocomplete para produtos
   - Seleção de fornecedor (opcional)
   - Data de validade (validFrom/validUntil)
   - Notas adicionais
   - Validação de valores positivos

2. **CostHistoryTable.tsx** - Tabela de histórico
   - Colunas: Data, Produto, Custo Anterior, Custo Novo, Variação %, Fornecedor
   - Filtros por produto, período, fornecedor
   - Paginação (50 itens/página)
   - Ordenação por coluna
   - Export para CSV/Excel

3. **CostTrendChart.tsx** - Gráfico de evolução de custos
   - **Tipo:** Line Chart (Recharts)
   - **Eixo X:** Tempo (mensal)
   - **Eixo Y:** Custo médio (R$)
   - **Linhas:** Múltiplas linhas para diferentes produtos ou categorias
   - **Interatividade:** Tooltip mostrando valor exato, hover para destacar
   - **Cores:** Gradient do tema (azul para custos estáveis, vermelho para aumentos)

4. **BulkCostImport.tsx** - Import em massa
   - Upload de arquivo CSV/Excel
   - Preview dos dados antes de salvar
   - Validação de formato
   - Mensagens de erro claras
   - Template de exemplo para download

**Exemplo de Visualização - Cost History:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Histórico de Custos - Últimos 6 Meses                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Custo Médio (R$)                                                  │
│   20 ┤                                              ╭─╮            │
│      │                                          ╭───╯ ╰─╮          │
│   15 ┤                      ╭───────────────────╯       ╰─╮       │
│      │          ╭───────────╯                            ╰──      │
│   10 ┤  ────────╯                                                 │
│      │                                                             │
│    5 ┤                                                             │
│      └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬──  │
│         Mai  Jun  Jul  Ago  Set  Out  Nov  Dez  Jan  Fev  Mar     │
│                                                                     │
│  ─── Carne Bovina    ─── Queijo    ─── Tomate                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 2. DRE Gerencial (Demonstrativo de Resultados do Exercício)

#### 2.1 Objetivo
Fornecer uma visão estruturada e clara do fluxo financeiro: de onde vem o dinheiro (receitas), para onde vai (custos e despesas), e quanto sobra (lucro).

#### 2.2 Estrutura do DRE

```
(+) RECEITA BRUTA
    ├─ Vendas Presencial
    ├─ Vendas iFood
    ├─ Vendas Rappi
    └─ Outros canais

(-) DEDUÇÕES
    ├─ Descontos
    ├─ Cancelamentos
    └─ Devoluções

(=) RECEITA LÍQUIDA

(-) CMV (Custo de Mercadoria Vendida)
    ├─ Insumos
    ├─ Embalagens
    └─ Outros custos diretos

(=) LUCRO BRUTO

(-) DESPESAS OPERACIONAIS
    ├─ Pessoal (Mão de Obra)
    ├─ Aluguel
    ├─ Utilidades (luz, água, gás)
    ├─ Marketing
    ├─ Manutenção
    └─ Outras despesas

(=) LUCRO OPERACIONAL (EBITDA Simplificado)

(-) COMISSÕES DE CANAIS
    ├─ Comissão iFood
    ├─ Comissão Rappi
    └─ Outras comissões

(=) LUCRO LÍQUIDO
```

#### 2.3 Backend - DRE Service

**Novos Endpoints:**

```typescript
GET /api/financial/dre
  Query params:
    - storeId (opcional, default: todos)
    - startDate (obrigatório)
    - endDate (obrigatório)
    - period: 'daily' | 'weekly' | 'monthly' (default: monthly)

  Response: {
    period: { start, end },
    grossRevenue: number,
    deductions: { discounts, cancellations, total },
    netRevenue: number,
    cogs: { total, byCategory },
    grossProfit: number,
    grossMargin: number, // %
    operatingExpenses: {
      labor, rent, utilities, marketing, maintenance, other, total
    },
    operatingProfit: number,
    channelCommissions: { byChannel, total },
    netProfit: number,
    netMargin: number, // %
    primeCost: { value, percentage }
  }

GET /api/financial/dre/compare
  Query params: mesmos + comparisonStartDate, comparisonEndDate
  Response: { current, comparison, variance }
```

**Service Implementation:**

```typescript
// backend/src/services/FinancialService.ts
class FinancialService {
  async generateDRE(filters: DREFilters) {
    // 1. Calcular Receita Bruta (soma de todas as sales)
    const grossRevenue = await this.calculateGrossRevenue(filters);

    // 2. Calcular Deduções (descontos, cancelamentos)
    const deductions = await this.calculateDeductions(filters);

    // 3. Receita Líquida
    const netRevenue = grossRevenue - deductions.total;

    // 4. Calcular CMV (usando CostService)
    const cogs = await this.costService.calculateCOGS(filters);

    // 5. Lucro Bruto
    const grossProfit = netRevenue - cogs.total;
    const grossMargin = (grossProfit / netRevenue) * 100;

    // 6. Despesas Operacionais
    const operatingExpenses = await this.getOperatingExpenses(filters);

    // 7. Lucro Operacional
    const operatingProfit = grossProfit - operatingExpenses.total;

    // 8. Comissões de Canais
    const channelCommissions = await this.calculateChannelCommissions(filters);

    // 9. Lucro Líquido
    const netProfit = operatingProfit - channelCommissions.total;
    const netMargin = (netProfit / netRevenue) * 100;

    // 10. Prime Cost
    const primeCost = await this.costService.calculatePrimeCost(filters);

    return { /* estrutura completa do DRE */ };
  }
}
```

#### 2.4 Frontend - Visualizações do DRE

**Nova Página:** `/dashboard/financial/dre`

**Componente Principal: DREDashboard.tsx**

**Visualização 1: Waterfall Chart (Cascata)**

O gráfico de cascata é a visualização mais poderosa para DRE, mostrando como a receita "cai" através de cada categoria de custo.

```typescript
// Configuração do Waterfall Chart usando Recharts
const waterfallData = [
  { name: 'Receita Bruta', value: 150000, type: 'positive', cumulative: 150000 },
  { name: 'Deduções', value: -5000, type: 'negative', cumulative: 145000 },
  { name: 'CMV', value: -45000, type: 'negative', cumulative: 100000 },
  { name: 'Lucro Bruto', value: 0, type: 'total', cumulative: 100000 },
  { name: 'Despesas Op.', value: -35000, type: 'negative', cumulative: 65000 },
  { name: 'Comissões', value: -15000, type: 'negative', cumulative: 50000 },
  { name: 'Lucro Líquido', value: 0, type: 'total', cumulative: 50000 },
];
```

**Especificações do Gráfico:**

- **Biblioteca:** Recharts (customizado) ou Recharts + lógica manual
- **Tipo:** BarChart com lógica de empilhamento customizada
- **Cores:**
  - Positivo/Receita: `#10b981` (verde)
  - Negativo/Custos: `#ef4444` (vermelho)
  - Totais: `#3b82f6` (azul)
  - Conectores: Linhas tracejadas cinzas
- **Altura:** 400px
- **Responsivo:** Sim, labels verticais em mobile
- **Tooltip:**
  ```
  Receita Bruta
  R$ 150.000,00
  100% da receita
  ```
- **Animação:** Entrada sequencial (cascade effect), 1500ms

**Exemplo Visual:**

```
DRE - Outubro 2025
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  R$ 150k ┤ ████████                                        │
│          │ ████████                                         │
│          │ ████████ ╲                                      │
│  R$ 100k ┤ ████████  ╲ ████                                │
│          │ ████████   ╲████                                │
│          │ ████████    ████ ╲                              │
│   R$ 50k ┤ ████████    ████  ╲ ██████                      │
│          │ ████████    ████   ╲██████                      │
│          │ ████████    ████    ██████ ╲                    │
│    R$ 0k ┤─────────────────────────────╲─────────────────  │
│          │ Receita   CMV    Despesas   Lucro               │
│          │  Bruta           Operac.    Líquido             │
└─────────────────────────────────────────────────────────────┘

  Lucro Líquido: R$ 50.000,00 (33,3% margem)
  Prime Cost: R$ 75.000,00 (50,0% - ✓ Saudável)
```

**Visualização 2: Tabela Detalhada do DRE**

Componente: **DRETable.tsx**

```
┌──────────────────────────────────────────────────────────────┐
│  Demonstrativo de Resultados - Outubro 2025                 │
├──────────────────────────────────────┬───────────┬───────────┤
│  Linha                               │  Valor    │  % Receit│
├──────────────────────────────────────┼───────────┼───────────┤
│  (+) RECEITA BRUTA                   │ 150.000   │  100,0%  │
│      Presencial                      │  60.000   │   40,0%  │
│      iFood                           │  50.000   │   33,3%  │
│      Rappi                           │  40.000   │   26,7%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (-) Deduções                        │  -5.000   │   -3,3%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (=) RECEITA LÍQUIDA                 │ 145.000   │   96,7%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (-) CMV                             │ -45.000   │  -30,0%  │
│      Ingredientes                    │ -38.000   │  -25,3%  │
│      Embalagens                      │  -7.000   │   -4,7%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (=) LUCRO BRUTO                     │ 100.000   │   66,7%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (-) DESPESAS OPERACIONAIS           │ -35.000   │  -23,3%  │
│      Mão de Obra                     │ -20.000   │  -13,3%  │
│      Aluguel                         │  -8.000   │   -5,3%  │
│      Utilidades                      │  -4.000   │   -2,7%  │
│      Marketing                       │  -2.000   │   -1,3%  │
│      Outras                          │  -1.000   │   -0,7%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (-) COMISSÕES DE CANAIS             │ -15.000   │  -10,0%  │
│      iFood (30%)                     │ -15.000   │  -10,0%  │
│      Rappi (28%)                     │ -11.200   │   -7,5%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  (=) LUCRO LÍQUIDO                   │  50.000   │   33,3%  │
├──────────────────────────────────────┼───────────┼───────────┤
│  PRIME COST (CMV + Mão de Obra)      │  65.000   │   43,3%  │
└──────────────────────────────────────┴───────────┴───────────┘

  Status Prime Cost: ✓ Saudável (Ideal: 55-65%)
```

**Features da Tabela:**
- Hierarquia visual (indentação, cores)
- Linhas de total destacadas (bold, background diferente)
- Drill-down expansível (ex: clicar em "CMV" expande por categoria)
- Export para PDF e Excel
- Comparação lado a lado com período anterior

**Visualização 3: KPI Cards**

Componente: **DREKPICards.tsx**

4 cards principais no topo da página:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ LUCRO LÍQUIDO    │  │ MARGEM LÍQUIDA   │  │ LUCRO BRUTO      │  │ PRIME COST       │
│                  │  │                  │  │                  │  │                  │
│ R$ 50.000        │  │     33,3%        │  │ R$ 100.000       │  │     43,3%        │
│ ▲ +15% vs mês    │  │ ▲ +2,1pp         │  │ ▲ +8% vs mês     │  │ ▼ -3,2pp ✓       │
│    anterior      │  │                  │  │    anterior      │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### 3. Análise de CMV e Prime Cost

#### 3.1 Objetivo
Fornecer visibilidade granular sobre os dois maiores custos variáveis do restaurante: insumos (CMV) e mão de obra, que juntos formam o Prime Cost.

#### 3.2 Visualizações

**Nova Página:** `/dashboard/financial/prime-cost`

**Visualização 1: Gauge Chart do Prime Cost**

O gauge (medidor) mostra visualmente se o Prime Cost está na zona segura.

**Especificações:**

- **Biblioteca:** Recharts (RadialBarChart) ou Victory Gauge
- **Tipo:** Semi-círculo com ponteiro
- **Faixas de Cor:**
  - 0-55%: Verde (#10b981) - Excelente
  - 55-60%: Verde claro (#34d399) - Ótimo
  - 60-65%: Amarelo (#fbbf24) - Saudável
  - 65-70%: Laranja (#f97316) - Atenção
  - 70%+: Vermelho (#ef4444) - Crítico
- **Valor Central:** Grande, bold, com status textual
- **Animação:** Ponteiro se move suavemente ao carregar
- **Dimensões:** 300x200px

```
     Prime Cost - Outubro 2025

        ╱─────────────────╲
      ╱       60%           ╲
    ╱    ━━━━━━━━▶          ╲
   │   ╱                     │
   │  │      Saudável        │
   │   ╲                     │
    ╲                       ╱
      ╲                   ╱
        ╲─────────────────╱

     0%   20%   40%   60%   80%   100%
     ■ Excelente  ■ Ótimo  ■ Saudável  ■ Atenção  ■ Crítico
```

**Visualização 2: Donut Charts - Composição de Custos**

Dois gráficos de rosca lado a lado mostrando a composição do Prime Cost.

**Especificações:**

- **Biblioteca:** Recharts (PieChart com innerRadius)
- **Dimensões:** 250x250px cada
- **innerRadius:** 60%
- **Cores:** Palette degradê do azul (#3b82f6) ao roxo (#8b5cf6)
- **Label Central:** Valor total em destaque
- **Legenda:** Abaixo do gráfico com % e valores

```
    Composição CMV                 Composição Prime Cost

       ╭───────╮                      ╭───────╮
      ╱         ╲                    ╱         ╲
     │ R$ 45k   │                  │ R$ 65k   │
     │   CMV    │                  │  Prime   │
      ╲         ╱                    ╲         ╱
       ╰───────╯                      ╰───────╯

■ Proteínas 45%         ■ CMV 69%
■ Legumes 20%           ■ Mão de Obra 31%
■ Laticínios 15%
■ Embalagens 12%
■ Outros 8%
```

**Visualização 3: Trend Line - Evolução do Prime Cost**

Gráfico de linha mostrando evolução mensal com benchmark.

**Especificações:**

- **Biblioteca:** Recharts (LineChart)
- **Eixo X:** Meses (últimos 12)
- **Eixo Y:** Percentual (0-100%)
- **Linhas:**
  - Prime Cost atual (azul, espessura 3px)
  - Linha de benchmark 60% (tracejada, cinza)
  - Área de zona saudável 55-65% (fill verde transparente)
- **Tooltip:** Mostra valor %, R$ absoluto, status
- **Responsivo:** Empilha em mobile
- **Altura:** 350px

```
Prime Cost - Últimos 12 Meses

  %
  80┤
    │
  70┤                               ╭──╮
    │                          ╭────╯  ╰─╮        ⚠ Zona Crítica
  65┤─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┼─ ─ ─ ─ ─ ─ ─ ─
  60┤          ╭───╮          │
    │      ╭───╯   ╰──╮   ╭───╯                   ✓ Zona Saudável
  55┤─ ─ ─┼─ ─ ─ ─ ─ ─╰───╯─ ─ ─ ─ ─ ─ ─ ─ ─ ─
    │      │
  50┤──────╯                                       Zona Excelente
    └──┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬──
      Nov Dez Jan Fev Mar Abr Mai Jun Jul Ago Set

  Atual: 58,2% (✓ Saudável) | Média 12m: 59,7%
```

**Visualização 4: CMV por Categoria**

Tabela interativa com drill-down mostrando CMV detalhado.

```
┌──────────────────────────────────────────────────────────────────────┐
│  CMV por Categoria - Outubro 2025                                   │
├────────────────────┬───────────┬──────────┬──────────┬──────────────┤
│  Categoria         │  CMV (R$) │  % CMV   │ % Venda  │  Tendência   │
├────────────────────┼───────────┼──────────┼──────────┼──────────────┤
│  ▼ Proteínas       │  20.250   │  45,0%   │  13,5%   │  ▲ +8%       │
│    ├─ Carne Bov.   │  12.000   │  26,7%   │   8,0%   │  ▲ +12%      │
│    ├─ Frango       │   5.250   │  11,7%   │   3,5%   │  ▲ +3%       │
│    └─ Salmão       │   3.000   │   6,7%   │   2,0%   │  ▼ -2%       │
├────────────────────┼───────────┼──────────┼──────────┼──────────────┤
│  ▶ Laticínios      │   6.750   │  15,0%   │   4,5%   │  ─ 0%        │
│  ▶ Embalagens      │   5.400   │  12,0%   │   3,6%   │  ▲ +15%      │
│  ▶ Bebidas         │   9.000   │  20,0%   │   6,0%   │  ▼ -5%       │
│  ▶ Outros          │   3.600   │   8,0%   │   2,4%   │  ▲ +2%       │
├────────────────────┼───────────┼──────────┼──────────┼──────────────┤
│  TOTAL             │  45.000   │ 100,0%   │  30,0%   │  ▲ +6%       │
└────────────────────┴───────────┴──────────┴──────────┴──────────────┘

  ⚠ Alerta: Custo de Carne Bovina aumentou 12% este mês
  💡 Insight: % CMV/Venda de 30% está acima da meta de 28%
```

---

### 4. Análise de Lucratividade por Canal

#### 4.1 Objetivo
Revelar a rentabilidade real de cada canal de venda, expondo o impacto das comissões e custos específicos de cada canal.

#### 4.2 Backend

**Endpoint Principal:**

```typescript
GET /api/financial/channel-profitability
  Query params: storeId, startDate, endDate

  Response: {
    channels: [
      {
        channelId: number,
        channelName: string,
        grossRevenue: number,        // Receita bruta
        commissions: number,          // Comissões pagas
        commissionRate: number,       // Taxa %
        netRevenue: number,           // Receita líquida
        cogs: number,                 // CMV deste canal
        contributionMargin: number,   // Margem de contribuição
        contributionRate: number,     // % margem
        orderCount: number,
        avgTicket: number,
        profitPerOrder: number        // Lucro por pedido
      }
    ],
    summary: {
      totalGrossRevenue: number,
      totalCommissions: number,
      totalNetRevenue: number,
      totalContributionMargin: number,
      avgContributionRate: number
    },
    insights: [
      {
        type: 'warning' | 'opportunity' | 'info',
        message: string,
        channelId: number
      }
    ]
  }
```

**Lógica de Cálculo:**

```typescript
class ChannelProfitabilityService {
  async analyze(filters: DateRangeFilters) {
    for (const channel of channels) {
      // 1. Receita Bruta do canal
      const grossRevenue = await this.getChannelRevenue(channel.id, filters);

      // 2. Comissões (do BD ou input usuário)
      const commission = await this.getChannelCommission(channel.id, filters);
      const commissions = grossRevenue * (commission.rate / 100);

      // 3. Receita Líquida
      const netRevenue = grossRevenue - commissions;

      // 4. CMV específico do canal
      const cogs = await this.getChannelCOGS(channel.id, filters);

      // 5. Margem de Contribuição
      const contributionMargin = netRevenue - cogs;
      const contributionRate = (contributionMargin / grossRevenue) * 100;

      // 6. Métricas por pedido
      const orderCount = await this.getChannelOrders(channel.id, filters);
      const avgTicket = grossRevenue / orderCount;
      const profitPerOrder = contributionMargin / orderCount;
    }

    // Gerar insights automáticos
    this.generateInsights(channelsData);
  }

  generateInsights(data) {
    const insights = [];

    // Identificar canal com maior receita mas menor lucro
    const highRevenueChannel = maxBy(data, 'grossRevenue');
    const lowMarginChannel = minBy(data, 'contributionRate');

    if (highRevenueChannel.id === lowMarginChannel.id) {
      insights.push({
        type: 'warning',
        message: `${highRevenueChannel.name} gera 40% da receita, mas apenas 15% do lucro devido às altas comissões (${highRevenueChannel.commissionRate}%). Considere estratégias para migrar clientes para canais próprios.`,
        channelId: highRevenueChannel.id
      });
    }

    return insights;
  }
}
```

#### 4.3 Frontend - Visualizações

**Nova Página:** `/dashboard/financial/channel-profitability`

**Visualização 1: Grouped Bar Chart - Comparação de Canais**

Este é o gráfico mais importante desta seção.

**Especificações:**

- **Biblioteca:** Recharts (BarChart)
- **Tipo:** Barras agrupadas (grouped bars)
- **Eixo X:** Canais (Presencial, iFood, Rappi, etc)
- **Eixo Y:** Valores em R$
- **Séries de Dados (3 barras por canal):**
  1. Receita Bruta (azul #3b82f6)
  2. Receita Líquida (verde #10b981)
  3. Margem de Contribuição (roxo #8b5cf6)
- **Largura das Barras:** 30px cada, 10px gap
- **Tooltip:**
  ```
  iFood
  Receita Bruta: R$ 50.000
  Receita Líquida: R$ 35.000 (-30% comissão)
  Margem Contribuição: R$ 20.000 (40% da receita)
  ```
- **Legenda:** Horizontal no topo
- **Altura:** 400px
- **Responsivo:** Barras horizontais em mobile

```
Lucratividade por Canal - Outubro 2025

R$ 70k┤
      │     ██
R$ 60k┤     ██
      │     ██  ██
R$ 50k┤     ██  ██       ██
      │     ██  ██       ██
R$ 40k┤     ██  ██  ██   ██
      │ ██  ██  ██  ██   ██
R$ 30k┤ ██  ██  ██  ██   ██  ██
      │ ██  ██  ██  ██   ██  ██
R$ 20k┤ ██  ██  ██  ██   ██  ██  ██
      │ ██  ██  ██  ██   ██  ██  ██
R$ 10k┤ ██  ██  ██  ██   ██  ██  ██
      │ ██  ██  ██  ██   ██  ██  ██
R$  0k┼─██──██──██──██───██──██──██─────
      Presenc iFood Rappi Tel. App  Site

      ■ Receita Bruta  ■ Receita Líquida  ■ Margem Contrib.
```

**Visualização 2: Waterfall de Impacto das Comissões**

Mostra como as comissões "consomem" a receita bruta.

```
Impacto das Comissões - Total Mensal

R$150k┤████████████
      │████████████ Receita Bruta
      │████████████
R$120k┤████████████╲
      │████████████ ╲
      │████████████  ╲ ███████
R$ 90k┤████████████   ╲███████ Receita Líquida
      │████████████    ███████
      │                        (Após Comissões)
      │    ▼ -R$30k
      │   Comissões
      └────────────────────────────────────

Total de Comissões: R$ 30.000 (20% da receita)
  • iFood: R$ 15.000 (30% dos R$ 50k)
  • Rappi: R$ 11.200 (28% dos R$ 40k)
  • App Próprio: R$ 3.800 (10% dos R$ 38k)
```

**Visualização 3: Tabela Analítica Detalhada**

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Análise de Lucratividade por Canal - Outubro 2025                                            │
├─────────────┬──────────┬───────────┬───────────┬──────────┬────────────┬──────────┬──────────┤
│  Canal      │ Pedidos  │ Receita   │ Comissão  │ Receita  │ CMV        │ Margem   │ Lucro/   │
│             │          │ Bruta     │ (Taxa)    │ Líquida  │            │ Contrib. │ Pedido   │
├─────────────┼──────────┼───────────┼───────────┼──────────┼────────────┼──────────┼──────────┤
│ Presencial  │   800    │ R$ 60.000 │ R$ 0      │ R$ 60.000│ R$ 15.000  │ R$ 45.000│ R$ 56,25 │
│             │          │  (40,0%)  │   (0%)    │  (46,2%) │  (25,0%)   │  (75,0%) │          │
├─────────────┼──────────┼───────────┼───────────┼──────────┼────────────┼──────────┼──────────┤
│ iFood       │   650    │ R$ 50.000 │ R$ 15.000 │ R$ 35.000│ R$ 12.500  │ R$ 22.500│ R$ 34,62 │
│             │          │  (33,3%)  │  (30%)    │  (26,9%) │  (25,0%)   │  (45,0%) │          │
├─────────────┼──────────┼───────────┼───────────┼──────────┼────────────┼──────────┼──────────┤
│ Rappi       │   520    │ R$ 40.000 │ R$ 11.200 │ R$ 28.800│ R$ 10.000  │ R$ 18.800│ R$ 36,15 │
│             │          │  (26,7%)  │  (28%)    │  (22,2%) │  (25,0%)   │  (47,0%) │          │
├─────────────┼──────────┼───────────┼───────────┼──────────┼────────────┼──────────┼──────────┤
│ TOTAL       │  1.970   │ R$ 150k   │ R$ 26.200 │ R$ 123.8k│ R$ 37.500  │ R$ 86.3k │ R$ 43,81 │
│             │          │ (100,0%)  │  (17,5%)  │ (100,0%) │  (25,0%)   │  (57,5%) │          │
└─────────────┴──────────┴───────────┴───────────┴──────────┴────────────┴──────────┴──────────┘

📊 Insights Automáticos:
  ⚠ ALERTA: iFood é o 2º maior canal em receita (33%), mas tem a menor margem (45%)
  💡 OPORTUNIDADE: Presencial tem margem de 75%. Investir em atração de clientes presenciais
  📈 AÇÃO: Considere criar programa de fidelidade para migrar clientes de apps para canal próprio
```

**Visualização 4: Scatter Plot - Receita vs Margem**

Posiciona cada canal em um gráfico de dispersão mostrando volume (eixo X) vs lucratividade (eixo Y).

**Especificações:**

- **Biblioteca:** Recharts (ScatterChart)
- **Eixo X:** Receita Bruta (R$)
- **Eixo Y:** Taxa de Margem de Contribuição (%)
- **Bolhas:** Tamanho proporcional ao número de pedidos
- **Cores:** Uma cor por canal
- **Quadrantes:** Linhas de referência dividindo em 4 áreas
- **Labels:** Nome do canal próximo à bolha

```
Matriz Receita vs Margem

Margem
  %
  80┤  Alto Lucro         │  IDEAL ★
    │  Baixo Volume       │  Alto Lucro
    │                     │  Alto Volume
  60┤  • Presencial       │
    │                     │
    │                     │
  40┤─────────────────────┼─────────────────
    │                     │  • iFood (●●●●)
    │  Evitar             │  • Rappi (●●●)
  20┤                     │  Alto Volume
    │                     │  Baixo Lucro
    └─────────────────────┴─────────────────
     R$ 0      R$ 30k    R$ 50k    R$ 80k
                        Receita Bruta

  ● Tamanho da bolha = volume de pedidos
```

---

### 5. Análise de Ponto de Equilíbrio (Break-Even)

#### 5.1 Objetivo
Calcular o faturamento mínimo necessário para cobrir todos os custos (fixos + variáveis) e mostrar em tempo real o progresso em direção a esse objetivo.

#### 5.2 Backend

**Endpoints:**

```typescript
POST /api/financial/break-even/calculate
  Body: {
    storeId: number,
    period: 'daily' | 'monthly' | 'annual',
    fixedCosts: number,  // Opcional se já cadastrado
    variableCostRate: number  // % do faturamento (opcional, calc. automático)
  }

  Response: {
    fixedCosts: number,
    variableCostRate: number,  // Em %
    contributionMarginRate: number,  // Em %
    breakEvenRevenue: number,  // Faturamento necessário
    breakEvenUnits: number,  // Pedidos necessários (aprox)
    currentRevenue: number,  // Faturamento atual no período
    currentProgress: number,  // % do break-even atingido
    remainingRevenue: number,  // Quanto falta
    estimatedDate: Date | null,  // Data estimada para atingir (se tendência mantida)
    projections: {
      pessimistic: { date, revenue },
      realistic: { date, revenue },
      optimistic: { date, revenue }
    }
  }

GET /api/financial/break-even/progress
  Query: storeId, period (default: current month)
  Response: { daily progress data for visualization }
```

**Fórmula de Cálculo:**

```typescript
class BreakEvenService {
  calculate(fixedCosts: number, variableCostRate: number) {
    // 1. Margem de Contribuição = 100% - Custo Variável %
    const contributionMarginRate = 100 - variableCostRate;

    // 2. Ponto de Equilíbrio = Custos Fixos / (Margem de Contribuição %)
    const breakEvenRevenue = fixedCosts / (contributionMarginRate / 100);

    // 3. Pedidos necessários (usando ticket médio)
    const avgTicket = await this.getAvgTicket();
    const breakEvenUnits = Math.ceil(breakEvenRevenue / avgTicket);

    return { breakEvenRevenue, breakEvenUnits, contributionMarginRate };
  }

  async getProgress(storeId: number, period: Date) {
    const breakEven = await this.calculate(storeId);
    const currentRevenue = await this.getCurrentRevenue(storeId, period);

    const progress = (currentRevenue / breakEven.breakEvenRevenue) * 100;
    const remaining = breakEven.breakEvenRevenue - currentRevenue;

    // Projetar quando atingirá o break-even
    const dailyAvg = await this.getDailyAvgRevenue(storeId);
    const daysRemaining = Math.ceil(remaining / dailyAvg);
    const estimatedDate = addDays(new Date(), daysRemaining);

    return { ...breakEven, currentRevenue, progress, remaining, estimatedDate };
  }
}
```

#### 5.3 Frontend - Visualizações

**Nova Página:** `/dashboard/financial/break-even`

**Visualização 1: Break-Even Chart (Linhas)**

O gráfico clássico de ponto de equilíbrio mostrando onde custos e receita se encontram.

**Especificações:**

- **Biblioteca:** Recharts (LineChart)
- **Eixo X:** Volume/Receita (R$ 0 a R$ 150k)
- **Eixo Y:** Custos/Receita (R$)
- **Linhas:**
  1. Custo Total (vermelho): começa em custos fixos, cresce linearmente
  2. Receita Total (verde): começa em 0, cresce linearmente
  3. Custos Fixos (cinza tracejado): linha horizontal
- **Ponto de Interseção:** Marcado com círculo e label "Break-Even"
- **Áreas:**
  - Área de Prejuízo (vermelho transparente): abaixo do break-even
  - Área de Lucro (verde transparente): acima do break-even
- **Linha Vertical:** Posição atual (azul tracejado)
- **Altura:** 400px

```
Análise de Ponto de Equilíbrio - Outubro 2025

R$150k┤                               ╱ Receita Total
      │                            ╱ ╱
R$120k┤                         ╱ ╱ │ Área de LUCRO
      │                      ╱ ╱   │  (verde)
R$ 90k┤                   ╱ ╱     │
      │                ╱ ╱ ●◄─── Break-Even
R$ 60k┤      ─ ─ ─ ─ ╱ ╱ ─ ─ ─ Custos Fixos
      │           ╱ ╱         │
R$ 30k┤ Área de╱ ╱PREJUÍZO   │
      │      ╱ ╱  (vermelho)  │
R$  0k┼────╱─┬────────────────┴──────────────
      R$ 0  │R$ 60k        R$ 100k    R$ 150k
            │ Break-Even
            │ Point
            ▼ Você está aqui (R$ 85k)
              ✓ 42% acima do break-even

Break-Even: R$ 60.000 | Atual: R$ 85.000 | Lucro: R$ 25.000
```

**Visualização 2: Progress Bar - Progresso Mensal**

Barra de progresso visual mostrando quanto do break-even já foi atingido no mês.

**Especificações:**

- **Tipo:** Barra horizontal customizada
- **Largura:** 100% (responsive)
- **Altura:** 80px
- **Segmentos:**
  - 0-100%: Gradient azul para verde
  - 100%+: Verde sólido
- **Marcadores:**
  - 50%, 75%, 100% (linhas verticais com labels)
- **Animação:** Preenche progressivamente em 2s

```
┌──────────────────────────────────────────────────────────────────┐
│  Progresso do Break-Even - Outubro 2025 (Dia 20/31)             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  R$ 0                                            R$ 60k          │
│  ├════════════════════════════════════════●───────┤              │
│  0%       25%        50%        75%      100%                    │
│                                        ▲                         │
│                                  R$ 85.000                       │
│                                  142% ✓                          │
│                                                                  │
│  ✓ Break-even atingido em 18/10/2025                            │
│  💰 Lucro acumulado: R$ 25.000                                   │
│  📈 Projeção fim do mês: R$ 130.000 (217% do break-even)        │
└──────────────────────────────────────────────────────────────────┘
```

**Visualização 3: Daily Progress Chart**

Gráfico de área mostrando o progresso diário em direção ao break-even.

**Especificações:**

- **Biblioteca:** Recharts (AreaChart)
- **Eixo X:** Dias do mês (1-31)
- **Eixo Y:** Receita acumulada (R$)
- **Áreas:**
  1. Receita Acumulada Real (azul sólido)
  2. Projeção Otimista (azul transparente, tracejado)
  3. Projeção Realista (azul transparente, tracejado)
- **Linha de Referência:** Break-even (vermelho horizontal tracejado)
- **Tooltip:** Mostra receita do dia, acumulada, % do break-even
- **Altura:** 350px

```
Progresso Diário - Outubro 2025

R$120k┤                              ╱╱╱ Projeção
      │                           ╱╱╱    Otimista
R$ 90k┤                        ╱╱╱
      │                     ╱╱╱
R$ 60k┤─ ─ ─ ─ ─ ─ ─ ─ ─ ╱╱╱─ ─ ─ ─ ─  Break-Even
      │              ╱╱╱╱
R$ 30k┤         ╱╱╱╱╱  ▲
      │    ╱╱╱╱╱       │
R$  0k┼╱╱╱╱─────────────┴──────────────
      1   5   10   15  20  25   30
                       Hoje

  Break-even atingido: Dia 18 ✓
  Dias até break-even: -2 (já atingido)
  Meta: R$ 120k até fim do mês (projeção: R$ 130k ✓)
```

**Visualização 4: Sensitivity Analysis Table**

Tabela mostrando cenários "E se...?" para diferentes níveis de receita.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Análise de Sensibilidade - Break-Even                              │
├──────────────┬───────────────┬────────────────┬──────────────────────┤
│  Cenário     │  Receita      │  Resultado     │  Status              │
│              │  Necessária   │  Líquido       │                      │
├──────────────┼───────────────┼────────────────┼──────────────────────┤
│  Mínimo      │  R$ 60.000    │  R$ 0          │  ⚖ Break-Even        │
│  Viável      │                                                        │
├──────────────┼───────────────┼────────────────┼──────────────────────┤
│  Cenário     │  R$ 80.000    │  R$ 20.000     │  ✓ Lucro Modesto     │
│  Conservador │  (+33%)       │  (25% margem)  │                      │
├──────────────┼───────────────┼────────────────┼──────────────────────┤
│  Cenário     │  R$ 100.000   │  R$ 40.000     │  ✓✓ Lucro Saudável   │
│  Realista    │  (+67%)       │  (40% margem)  │                      │
├──────────────┼───────────────┼────────────────┼──────────────────────┤
│  Cenário     │  R$ 120.000   │  R$ 60.000     │  ★ Excelente         │
│  Otimista    │  (+100%)      │  (50% margem)  │                      │
├──────────────┼───────────────┼────────────────┼──────────────────────┤
│  Atual       │  R$ 85.000    │  R$ 25.000     │  ✓ No Caminho        │
│  (20/10)     │  (142% B-E)   │  (29% margem)  │  Certo               │
└──────────────┴───────────────┴────────────────┴──────────────────────┘

Custos Fixos Mensais: R$ 40.000
Custos Variáveis: 35% da receita
Margem de Contribuição: 65%

💡 Para aumentar R$ 10k no lucro, você precisa de:
   • R$ 15.385 em receita adicional, OU
   • Reduzir custos fixos em R$ 10.000, OU
   • Melhorar margem de contribuição de 65% para 70%
```

**Componente Adicional: KPI Cards do Break-Even**

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ BREAK-EVEN      │ │ PROGRESSO       │ │ FALTA           │ │ PREVISÃO        │
│                 │ │                 │ │                 │ │                 │
│ R$ 60.000/mês   │ │     142%        │ │ Atingido!       │ │  Dia 18/10      │
│                 │ │  ████████░░     │ │ +R$ 25k lucro   │ │  ✓ 3 dias antes │
│ 920 pedidos     │ │                 │ │                 │ │    do esperado  │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🗓️ Roadmap de Implementação

### Semana 1: Fundação e Gestão de Custos (5 dias úteis)

**Dia 1-2: Database & Backend Foundation**
- [ ] Criar migrations Prisma para novos modelos
- [ ] Implementar seeds para dados de teste
- [ ] Criar `CostService` com lógicas de cálculo
- [ ] Implementar endpoints de custos de produtos
- [ ] Implementar endpoints de fornecedores
- [ ] Testes unitários dos services

**Dia 3-4: Frontend - Cost Management**
- [ ] Criar página `/dashboard/financial/costs`
- [ ] Implementar `CostInputForm` component
- [ ] Implementar `CostHistoryTable` component
- [ ] Implementar `CostTrendChart` component
- [ ] Implementar `BulkCostImport` component

**Dia 5: Integration & Testing**
- [ ] Integração frontend-backend
- [ ] Testes E2E do fluxo de custos
- [ ] Ajustes de UX e validações

---

### Semana 2: DRE e Lucratividade por Canal (5 dias úteis)

**Dia 6-7: DRE Backend**
- [ ] Criar `FinancialService` com lógica de DRE
- [ ] Implementar endpoints de DRE
- [ ] Implementar endpoints de despesas operacionais
- [ ] Implementar endpoints de custos fixos
- [ ] Implementar cálculo de Prime Cost
- [ ] Cache strategy (Redis, 15min TTL)

**Dia 8-9: DRE Frontend**
- [ ] Criar página `/dashboard/financial/dre`
- [ ] Implementar Waterfall Chart component
- [ ] Implementar DRE Table component
- [ ] Implementar DRE KPI Cards
- [ ] Implementar formulário de despesas operacionais
- [ ] Implementar comparação de períodos

**Dia 10: Channel Profitability**
- [ ] Implementar `ChannelProfitabilityService`
- [ ] Criar endpoints de lucratividade por canal
- [ ] Implementar Grouped Bar Chart
- [ ] Implementar tabela analítica de canais
- [ ] Sistema de insights automáticos

---

### Semana 3: Prime Cost e Break-Even (5 dias úteis)

**Dia 11-12: Prime Cost Analysis**
- [ ] Criar página `/dashboard/financial/prime-cost`
- [ ] Implementar Gauge Chart component
- [ ] Implementar Donut Charts (composição)
- [ ] Implementar Trend Line do Prime Cost
- [ ] Implementar tabela de CMV por categoria
- [ ] Sistema de alertas de Prime Cost

**Dia 13-14: Break-Even Analysis**
- [ ] Implementar `BreakEvenService`
- [ ] Criar endpoints de break-even
- [ ] Criar página `/dashboard/financial/break-even`
- [ ] Implementar Break-Even Chart (linhas)
- [ ] Implementar Progress Bar component
- [ ] Implementar Daily Progress Chart
- [ ] Implementar Sensitivity Analysis Table

**Dia 15: Polish & Documentation**
- [ ] Revisão geral de UX
- [ ] Ajustes de responsividade
- [ ] Otimização de performance
- [ ] Documentação da API (Swagger)
- [ ] Guia do usuário (help tooltips)
- [ ] Testes E2E completos

---

## 📐 Especificações Técnicas Gerais

### Bibliotecas de Gráficos

**Recharts** (principal):
```bash
npm install recharts
```

**Configuração Base:**
```typescript
// Tema global dos gráficos
export const chartTheme = {
  colors: {
    primary: '#3b82f6',    // azul
    success: '#10b981',    // verde
    warning: '#f59e0b',    // amarelo
    danger: '#ef4444',     // vermelho
    purple: '#8b5cf6',     // roxo
    gray: '#6b7280',       // cinza
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    size: {
      small: 12,
      medium: 14,
      large: 16,
    }
  },
  spacing: {
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  }
};

// Configuração padrão de tooltip
export const defaultTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
  },
  labelStyle: {
    color: '#fff',
    fontWeight: 600,
  },
  itemStyle: {
    color: '#e5e7eb',
  }
};
```

### Formatação de Dados

**Utilities:**
```typescript
// utils/formatters.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const calculateVariance = (current: number, previous: number) => {
  if (previous === 0) return { value: 0, percentage: 0, trend: 'neutral' };

  const variance = current - previous;
  const percentage = (variance / previous) * 100;
  const trend = variance > 0 ? 'up' : variance < 0 ? 'down' : 'neutral';

  return { value: variance, percentage, trend };
};
```

### Caching Strategy

**Backend (Redis):**
```typescript
// Diferentes TTLs para diferentes tipos de dados
const CACHE_TTL = {
  DRE: 15 * 60,              // 15 minutos
  COSTS: 30 * 60,            // 30 minutos
  BREAK_EVEN: 60 * 60,       // 1 hora
  CHANNEL_PROFIT: 15 * 60,   // 15 minutos
  PRIME_COST: 15 * 60,       // 15 minutos
};

// Cache keys pattern
const getCacheKey = (type: string, params: object) => {
  const paramStr = JSON.stringify(params);
  const hash = hashObject(paramStr);
  return `financial:${type}:${hash}`;
};
```

**Frontend (React Query):**
```typescript
// Configuração de cache para queries financeiras
export const financialQueryConfig = {
  staleTime: 10 * 60 * 1000,    // 10 minutos
  cacheTime: 30 * 60 * 1000,    // 30 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};
```

### Acessibilidade

Todos os gráficos devem seguir:

- **Contraste:** WCAG AA mínimo (4.5:1)
- **Cores:** Não usar apenas cor para transmitir informação (adicionar ícones/padrões)
- **Navegação:** Suporte a teclado em todos os componentes interativos
- **Screen Readers:** ARIA labels em todos os gráficos
- **Tooltips:** Descritivos e informativos

```typescript
// Exemplo de acessibilidade em gráfico
<BarChart
  accessibilityLayer
  aria-label="Gráfico de lucratividade por canal de vendas"
  role="img"
>
  {/* ... */}
</BarChart>
```

### Responsividade

**Breakpoints:**
```typescript
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};

// Adaptações por dispositivo:
// Mobile: Gráficos empilhados verticalmente, barras horizontais
// Tablet: Layout 2 colunas
// Desktop: Layout 3-4 colunas, gráficos lado a lado
```

---

## ✅ Critérios de Aceitação

### Para Módulo de Custos
- [ ] Usuário consegue cadastrar custo de produto em < 30 segundos
- [ ] Import em massa processa 100+ produtos em < 5 segundos
- [ ] Histórico de custos carrega em < 1 segundo
- [ ] Gráfico de tendência mostra últimos 12 meses claramente
- [ ] Sistema alerta quando custo aumenta > 10%

### Para DRE
- [ ] DRE completo é gerado em < 3 segundos
- [ ] Waterfall chart é visualmente claro e intuitivo
- [ ] Usuário consegue entender estrutura de custos em 1 minuto
- [ ] Comparação de períodos mostra variações claramente
- [ ] Export para Excel mantém formatação

### Para Lucratividade por Canal
- [ ] Insights automáticos são gerados corretamente
- [ ] Gráfico de barras agrupadas é legível com 6+ canais
- [ ] Sistema identifica canal menos lucrativo automaticamente
- [ ] Cálculo de comissões está 100% correto

### Para Prime Cost
- [ ] Gauge mostra zona (saudável/atenção/crítica) corretamente
- [ ] Sistema alerta quando Prime Cost > 65%
- [ ] Breakdown por categoria de CMV está correto
- [ ] Trend line mostra evolução de 12 meses

### Para Break-Even
- [ ] Cálculo do ponto de equilíbrio está matematicamente correto
- [ ] Progress bar atualiza em tempo real
- [ ] Projeções são baseadas em tendências reais
- [ ] Sensitivity analysis mostra cenários úteis

---

## 🎨 Design System - Componentes Reutilizáveis

Para manter consistência, criar biblioteca de componentes:

### KPICard Component
```typescript
<KPICard
  title="Lucro Líquido"
  value={50000}
  format="currency"
  trend={{ value: 15, period: 'vs mês anterior' }}
  status="success"
  icon={TrendingUpIcon}
/>
```

### ChartContainer Component
```typescript
<ChartContainer
  title="DRE Gerencial"
  subtitle="Outubro 2025"
  actions={[
    { label: 'Exportar', onClick: handleExport },
    { label: 'Comparar', onClick: handleCompare }
  ]}
  filters={<PeriodSelector />}
>
  <WaterfallChart data={dreData} />
</ChartContainer>
```

### DataTable Component
```typescript
<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  exportable
  pagination={{ pageSize: 50 }}
  onRowClick={handleRowClick}
/>
```

---

## 🚀 Próximos Passos (Pós-Fase 1)

Após completar a Fase 1, a plataforma estará pronta para:

- **Fase 2:** Engenharia de Cardápio (Matriz de Menu Engineering, Market Basket Analysis)
- **Fase 3:** Inteligência de Cliente (CRM, RFM, Lifetime Value)
- **Fase 4:** Analytics Preditivos (Forecasting, Recomendações com IA)

---

## 📚 Referências e Benchmarks

### Benchmarks da Indústria
- **Prime Cost Ideal:** 55-65% da receita
- **CMV Ideal:** 28-35% da receita
- **Custo de Mão de Obra:** 25-35% da receita
- **Margem Líquida Saudável:** 10-15%
- **Comissões Delivery:** iFood 27-32%, Rappi 25-30%

### Fórmulas Importantes

```
Lucro Bruto = Receita Líquida - CMV
Margem Bruta % = (Lucro Bruto / Receita Líquida) × 100

Prime Cost = CMV + Custo Mão de Obra
Prime Cost % = (Prime Cost / Receita Total) × 100

Margem de Contribuição = Receita - Custos Variáveis
Taxa de Margem = (Margem Contribuição / Receita) × 100

Break-Even = Custos Fixos / (1 - (Custos Variáveis / Receita))

ROI = ((Ganho - Investimento) / Investimento) × 100
```

---

## 🎯 Métricas de Sucesso da Fase 1

Ao final da implementação, medir:

1. **Performance Técnica:**
   - Tempo de carregamento DRE < 3s
   - Cache hit rate > 80%
   - API response time p95 < 500ms

2. **Adoção pelos Usuários:**
   - 80%+ dos gestores acessam DRE semanalmente
   - Custos cadastrados para 90%+ dos produtos
   - 3+ insights acionados por mês

3. **Impacto no Negócio:**
   - Redução de 10-15% no CMV médio
   - Identificação de R$ 5k-10k/mês em oportunidades
   - Melhoria de 5pp na margem líquida

---

**Fase 1 completa transforma a plataforma Mise de um dashboard de vendas em um sistema completo de gestão financeira, equipando restaurantes com as ferramentas necessárias para tomar decisões baseadas em dados e maximizar sua lucratividade.**
