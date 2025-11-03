# 🍽️ Mise - Restaurant Analytics Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2F5.7-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Redis](https://img.shields.io/badge/Redis-7-DC382D)
![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748)
![API Endpoints](https://img.shields.io/badge/API_Endpoints-40+-00AA00)
![Components](https://img.shields.io/badge/Components-66+-purple)
![Services](https://img.shields.io/badge/Services-18-orange)

**Mise** é uma plataforma completa de análise de dados para restaurantes, oferecendo insights detalhados sobre vendas, produtos, canais e performance operacional. Desenvolvida com tecnologias modernas e foco em performance e experiência do usuário.

> **Status Atual**: Fase 1 concluída - Sistema completo de dashboards customizáveis com Query Builder e módulo financeiro
>
> **Branch Ativa**: `feature/custom-dashboards`
>
> **Últimas Atualizações**: Implementação de dashboards personalizáveis com templates e catálogo de métricas

---

## 📋 Índice

- [Novidades](#-novidades)
- [Screenshots](#-screenshots)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#%EF%B8%8F-tecnologias)
- [Quick Start](#-quick-start)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Desenvolvimento](#-desenvolvimento)
- [API Endpoints](#-api-endpoints)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Documentação Adicional](#-documentação-adicional)
- [Build e Deploy](#-build-e-deploy)
- [Customização](#-customização)
- [Troubleshooting](#-troubleshooting)
- [Métricas do Projeto](#-métricas-do-projeto)
- [Contribuindo](#-contribuindo)

---

## 🚀 Novidades

### Funcionalidades Recentes (Fase 1 - Concluída)
- 🎯 **Dashboard Templates**: Sistema de templates pré-configurados para análises rápidas (vendas, produtos, canais, lojas)
- 📊 **Catálogo de Métricas**: Biblioteca com 15+ métricas prontas para uso em dashboards customizados
- 🔍 **Query Builder**: Construtor visual de consultas com sistema de tradução PT-BR - crie análises customizadas arrastando métricas e dimensões
- 💰 **Análise Financeira Completa**: Módulo de custos, despesas operacionais, fornecedores e análise de rentabilidade por canal
- 📊 **Break-even Analysis**: Análise de ponto de equilíbrio e margens de contribuição
- 🎯 **KPI Cards Dinâmicos**: Cartões de métricas principais configuráveis no Query Builder
- 📈 **Múltiplos Tipos de Visualização**: Tabelas, gráficos de barras, linhas, pizza e KPIs personalizáveis
- 📤 **Exportação Premium**: PDF, Excel (XLSX), CSV e screenshots de gráficos
- 🎨 **Custom Dashboards**: Salve e compartilhe consultas personalizadas com layouts customizáveis
- ⚡ **Performance Otimizada**: Cache Redis com ioredis para consultas ultra-rápidas
- 🏪 **Performance de Lojas**: Compare métricas entre unidades e veja produtos mais vendidos por loja
- 📈 **Insights Inteligentes**: Heatmaps, análise temporal e insights automáticos
- 🔄 **API Expandida**: 40+ endpoints para análises aprofundadas

## 📸 Screenshots

### Dashboard Principal
Visão geral com métricas principais, vendas por hora e distribuição por canal.

### Análise de Canais
Compare a performance entre diferentes canais de venda (delivery, presencial, etc.).

### Explorador de Produtos
Análise detalhada do cardápio com métricas de vendas, customizações e combinações.

### Performance de Lojas
Compare métricas entre suas unidades e identifique oportunidades de melhoria.

### Insights Inteligentes
Visualize padrões de vendas através de heatmaps e análises temporais avançadas.

## ✨ Funcionalidades

### 📊 Dashboard Analítico
- **Métricas em tempo real**: Faturamento, pedidos, ticket médio e taxa de cancelamento
- **Comparações temporais**: Compare períodos e identifique tendências
- **Gráficos interativos**: Visualize vendas por hora e distribuição por canal
- **Top produtos**: Identifique os itens mais vendidos do seu cardápio

### 🔀 Análise de Canais
- **Performance por canal**: Compare métricas entre delivery, presencial e outros canais
- **Distribuição de vendas**: Gráfico de pizza mostrando participação de cada canal
- **Horários de pico**: Identifique os melhores horários para cada canal
- **Produtos mais vendidos**: Veja quais produtos performam melhor em cada canal
- **Tempo de preparo/entrega**: Monitore eficiência operacional
- **Taxa de cancelamento**: Acompanhe qualidade do serviço

### 🍕 Explorador de Produtos
- **Análise detalhada do cardápio**: Performance individual de cada produto
- **Filtros avançados**: Por categoria, canal, data e ordenação customizada
- **Customizações**: Veja quais adicionais e modificações são mais populares
- **Exportação de dados**: Exporte relatórios em múltiplos formatos

### 🏪 Performance de Lojas
- **Comparação entre lojas**: Compare faturamento, vendas e ticket médio
- **Ranking de lojas**: Identifique as lojas com melhor performance
- **Produtos mais vendidos por loja**: Análise específica do cardápio de cada unidade
- **Gráficos comparativos**: Visualize a distribuição de receita entre lojas
- **Métricas consolidadas**: Cards com totalizadores e indicadores-chave

### 📈 Insights Inteligentes
- **Heatmap de vendas**: Visualize padrões por dia da semana e hora do dia
- **Análise temporal**: Evolução de vendas com granularidade configurável (hora, dia, semana, mês)
- **Comparação de períodos**: Compare performance atual vs período anterior
- **Insights automáticos**: Identifique automaticamente tendências, picos e anomalias
- **Padrões de comportamento**: Descubra horários de pico e sazonalidades

### 🔍 Query Builder & Dashboards Customizados
- **Templates Pré-configurados**: Dashboards prontos para vendas, produtos, canais e lojas
- **Catálogo de Métricas**: 15+ métricas documentadas e prontas para uso
- **Construtor Visual**: Interface drag-and-drop para criar análises personalizadas
- **Sistema de Tradução**: Todos os campos técnicos do banco traduzidos para PT-BR
- **Métricas Dinâmicas**: Selecione entre receita, pedidos, ticket médio, margens, custos, lucro, etc.
- **Dimensões Configuráveis**: Agrupe por produto, canal, loja, categoria, dia da semana, hora, etc.
- **Múltiplas Visualizações**:
  - Tabelas interativas com ordenação
  - Gráficos de barras e linhas
  - Gráficos de pizza
  - KPI Cards com métricas principais
- **Filtros Avançados**: Data range, canais, lojas e categorias
- **Exportação Completa**: PDF, Excel (XLSX), CSV e screenshots de gráficos
- **Salvar Consultas**: Guarde suas análises favoritas para reutilização
- **Ajuda Contextual**: Tooltips e guia de início rápido integrados

### 💰 Análise Financeira (Fase 1)
- **Gestão de Custos de Produtos**:
  - Cadastro de fornecedores com histórico
  - Custos por produto com rastreabilidade
  - Margens de contribuição por item
- **Despesas Operacionais**:
  - 6 categorias: Mão de obra, Aluguel, Utilidades, Marketing, Manutenção, Outros
  - Controle de despesas fixas e variáveis
  - Análise de despesas por loja e período
- **Rentabilidade por Canal**:
  - Comissões específicas por canal de venda
  - Cálculo automático de lucro líquido
  - Comparação de margens entre canais
- **Break-even Analysis**:
  - Ponto de equilíbrio por produto e por loja
  - Margem de contribuição e markup
  - Projeções de vendas necessárias

### 📊 Relatórios Pré-configurados
- **Top produtos**: Ranking dos produtos mais vendidos
- **Horários de pico**: Performance detalhada por faixa horária
- **Comparação de canais**: Análise side-by-side entre canais de venda
- **Produtos de alta margem**: Identifique os itens mais lucrativos
- **Resumo mensal**: Relatório executivo consolidado
- **Ranking de lojas**: Compare todas as unidades em um único relatório
- **Exportação customizável**: Todos os relatórios disponíveis em CSV/Excel

### 🎯 Recursos Adicionais
- **Filtros globais**: Data range e seleção de lojas sincronizados em todas as páginas
- **Tema escuro/claro**: Interface adaptável às preferências do usuário
- **Cache inteligente**: Redis para consultas rápidas e eficientes
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🛠️ Tecnologias

### Backend
- **[Node.js 20](https://nodejs.org/)** - Runtime JavaScript
- **[TypeScript 5.7.3](https://www.typescriptlang.org/)** - Tipagem estática
- **[Express 4.21.2](https://expressjs.com/)** - Framework web minimalista
- **[Prisma 6.16.2](https://www.prisma.io/)** - ORM moderno
- **[PostgreSQL 15](https://www.postgresql.org/)** - Banco de dados relacional
- **[Redis 7](https://redis.io/)** - Cache em memória
- **[ioredis 5.8.2](https://github.com/redis/ioredis)** - Cliente Redis robusto para Node.js
- **[Zod 3.23.8](https://zod.dev/)** - Validação de schemas
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulação de datas
- **[Docker](https://www.docker.com/)** - Containerização

### Frontend
- **[Next.js 15.0.3](https://nextjs.org/)** - Framework React com App Router e Turbo mode
- **[React 18.3.1](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5.6.3](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS 3.4.14](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI reutilizáveis (Radix UI)
- **[Recharts 2.15.4](https://recharts.org/)** - Biblioteca de gráficos
- **[TanStack Query 5.59.0](https://tanstack.com/query)** - Gerenciamento de estado server (React Query)
- **[TanStack Table 8.20.5](https://tanstack.com/table)** - Tabelas poderosas e flexíveis
- **[Zustand 5.0.1](https://zustand-demo.pmnd.rs/)** - State management
- **[React Hook Form 7.66.0](https://react-hook-form.com/)** - Formulários performáticos
- **[Zod 3.25.76](https://zod.dev/)** - Validação de schemas
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulação de datas
- **[Lucide React 0.447.0](https://lucide.dev/)** - Ícones modernos

### Exportação & Visualização
- **[jsPDF 3.0.3](https://github.com/parallax/jsPDF)** - Geração de PDFs
- **[jspdf-autotable 5.0.2](https://github.com/simonbengtsson/jsPDF-AutoTable)** - Tabelas em PDF
- **[xlsx 0.18.5](https://sheetjs.com/)** - Exportação Excel (XLSX)
- **[html-to-image 1.11.13](https://github.com/bubkoo/html-to-image)** - Screenshots de gráficos
- **[react-grid-layout 1.5.2](https://github.com/react-grid-layout/react-grid-layout)** - Layouts customizáveis e draggable

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.x ou superior
- Docker e Docker Compose
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/ThaisFReis/mise.git
cd mise
```

### 2. Configure o Ambiente

**Backend:**
```bash
cd backend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

### 3. Inicie os Serviços com Docker

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL (porta 5433 externa, 5432 interna)
- Redis (porta 6379)
- Backend API (porta 3001, modo host network)
- Frontend Dev Server (porta 3000)

**Serviços opcionais** (profile tools):
```bash
# PgAdmin - Interface gráfica para PostgreSQL
docker-compose --profile tools up -d pgadmin
# Acesse em: http://localhost:5050

# Data Generator - Gerador de dados de exemplo
docker-compose --profile tools run data-generator
```

### 4. Configure o Banco de Dados

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 5. Gere Dados de Exemplo (Opcional)

Existem dois geradores de dados disponíveis:

**Versão MVP (dados básicos de vendas):**
```bash
# Na raiz do projeto
docker-compose --profile tools run data-generator
```

**Versão Fase 1 (inclui dados financeiros):**
```bash
# Usando Python diretamente
python3 generate_data_v2.py
```

O gerador v2 inclui:
- Dados de vendas completos (produtos, canais, lojas, clientes)
- Fornecedores e custos de produtos
- Despesas operacionais (6 categorias)
- Custos fixos por loja
- Comissões por canal
- Dados customizáveis via parâmetros

Para mais detalhes, consulte o [DATA_GENERATORS_GUIDE.md](DATA_GENERATORS_GUIDE.md)

### 6. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health
- **Prisma Studio** (opcional): `cd backend && npx prisma studio` - http://localhost:5555

## 📁 Estrutura do Projeto

```
mise/
├── backend/                    # API REST
│   ├── src/
│   │   ├── controllers/       # Controladores de rotas (18 controllers)
│   │   ├── services/          # Lógica de negócio (18 serviços)
│   │   │   ├── dashboardService.ts         # Métricas principais
│   │   │   ├── productService.ts           # Análise de produtos
│   │   │   ├── channelService.ts           # Análise de canais
│   │   │   ├── storeService.ts             # Performance de lojas
│   │   │   ├── insightsService.ts          # Insights e heatmaps
│   │   │   ├── reportsService.ts           # Relatórios pré-configurados
│   │   │   ├── QueryBuilderService.ts      # Query Builder dinâmico
│   │   │   ├── CostService.ts              # Gestão de custos
│   │   │   ├── ExpenseService.ts           # Despesas operacionais
│   │   │   ├── FinancialService.ts         # Análise financeira
│   │   │   ├── ChannelProfitabilityService.ts  # Rentabilidade
│   │   │   ├── BreakEvenService.ts         # Ponto de equilíbrio
│   │   │   ├── SupplierService.ts          # Gestão de fornecedores
│   │   │   ├── CategoryService.ts          # Categorias
│   │   │   ├── CustomReportService.ts      # Relatórios customizados
│   │   │   ├── cacheService.ts             # Cache Redis legado
│   │   │   ├── RedisService.ts             # Redis com ioredis
│   │   │   └── TemplateService.ts          # Templates de dashboard
│   │   ├── routes/            # Definição de rotas
│   │   ├── middleware/        # Middlewares customizados
│   │   ├── config/            # Configurações (DB, cache, etc)
│   │   ├── types/             # TypeScript types
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados (21 models)
│   └── package.json
│
├── frontend/                   # Aplicação Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 15)
│   │   │   ├── page.tsx               # Home
│   │   │   ├── dashboard/             # Páginas do dashboard (8 páginas)
│   │   │   │   ├── page.tsx           # Dashboard analytics
│   │   │   │   ├── channels/          # Análise de canais
│   │   │   │   ├── products/          # Explorador de produtos
│   │   │   │   ├── stores/            # Performance de lojas
│   │   │   │   ├── insights/          # Insights inteligentes
│   │   │   │   ├── financial/costs/   # Análise financeira
│   │   │   │   └── query-builder/     # Query Builder customizável
│   │   │   └── layout.tsx
│   │   ├── components/        # Componentes React (70+ componentes)
│   │   │   ├── charts/        # Gráficos (Recharts)
│   │   │   ├── dashboard/     # Componentes específicos
│   │   │   ├── insights/      # Componentes de insights
│   │   │   ├── reports/       # Componentes de relatórios
│   │   │   ├── financial/     # Componentes financeiros
│   │   │   ├── query-builder/ # Query Builder (12 componentes)
│   │   │   │   ├── MetricSelector.tsx
│   │   │   │   ├── DimensionSelector.tsx
│   │   │   │   ├── DateFilter.tsx
│   │   │   │   ├── ChartView.tsx
│   │   │   │   ├── ChartTypeTab.tsx
│   │   │   │   ├── ResultsTable.tsx
│   │   │   │   ├── KpiCards.tsx
│   │   │   │   ├── ExportMenu.tsx
│   │   │   │   ├── HelpTooltip.tsx
│   │   │   │   ├── QuickStartGuide.tsx
│   │   │   │   ├── TemplateSelector.tsx    # Templates
│   │   │   │   └── MetricsCatalog.tsx      # Catálogo
│   │   │   ├── layout/        # Sidebar, Header, Navigation
│   │   │   └── ui/            # Componentes base (shadcn/ui)
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilitários e API client
│   │   │   ├── api.ts         # Cliente API
│   │   │   ├── export.ts      # Funções de exportação
│   │   │   ├── exportStoresData.ts  # Export especializado
│   │   │   └── translations.ts # Sistema de tradução PT-BR
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── docker-compose.yml         # Configuração Docker
├── generate_data_v2.py        # Gerador de dados com financeiro (Fase 1)
├── DATA_GENERATORS_GUIDE.md   # Guia comparativo dos geradores
└── README.md
```

## 🔧 Desenvolvimento

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start

# Gerar cliente Prisma
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build de produção
npm start

# Lint
npm run lint
```

## 📊 API Endpoints

### Dashboard
- `GET /api/dashboard/overview` - Métricas principais
- `GET /api/dashboard/top-products` - Top produtos
- `GET /api/dashboard/revenue-by-hour` - Vendas por hora
- `GET /api/dashboard/revenue-by-channel` - Vendas por canal

### Canais
- `GET /api/channels/performance` - Performance dos canais
- `GET /api/channels/top-products` - Top produtos por canal
- `GET /api/channels/peak-hours` - Horários de pico
- `GET /api/channels/timeline` - Evolução temporal

### Produtos
- `GET /api/products` - Lista de produtos com paginação
- `GET /api/products/:id` - Detalhes de um produto
- `GET /api/products/:id/customizations` - Customizações do produto

### Lojas
- `GET /api/stores` - Lista de lojas
- `GET /api/stores/performance` - Performance comparativa entre lojas

### Insights
- `GET /api/insights/heatmap` - Heatmap de vendas (dia da semana x hora)
- `GET /api/insights/period-comparison` - Comparação entre períodos
- `GET /api/insights/timeline` - Timeline com granularidade configurável
- `GET /api/insights/auto-insights` - Insights automáticos baseados em padrões

### Relatórios
- `GET /api/reports/top-products` - Relatório de top produtos
- `GET /api/reports/peak-hours` - Relatório de horários de pico
- `GET /api/reports/channel-comparison` - Comparação entre canais
- `GET /api/reports/high-margin-products` - Produtos de alta margem
- `GET /api/reports/monthly-summary` - Resumo mensal executivo
- `GET /api/reports/store-ranking` - Ranking de lojas

### Relatórios Customizados
- `GET /api/custom-reports` - Lista de relatórios salvos
- `POST /api/custom-reports` - Criar relatório customizado
- `GET /api/custom-reports/:id` - Obter relatório específico
- `PUT /api/custom-reports/:id` - Atualizar relatório
- `DELETE /api/custom-reports/:id` - Deletar relatório
- `POST /api/custom-reports/:id/execute` - Executar relatório e obter dados

### Query Builder (Novo!)
- `GET /api/query-builder/metadata` - Obter métricas e dimensões disponíveis
- `POST /api/query-builder/execute` - Executar consulta customizada
  - Parâmetros: metrics, dimensions, filters, dateRange
  - Retorna: dados agregados prontos para visualização

### Financeiro (Fase 1)
- `GET /api/financial/overview` - Visão geral financeira
- `GET /api/financial/profitability` - Análise de rentabilidade
- `GET /api/financial/channel-profitability` - Rentabilidade por canal

### Custos (Fase 1)
- `GET /api/costs` - Lista de custos de produtos
- `POST /api/costs` - Criar custo de produto
- `PUT /api/costs/:id` - Atualizar custo
- `DELETE /api/costs/:id` - Deletar custo
- `GET /api/costs/product/:productId` - Histórico de custos do produto

### Despesas (Fase 1)
- `GET /api/expenses` - Lista de despesas operacionais
- `POST /api/expenses` - Criar despesa
- `PUT /api/expenses/:id` - Atualizar despesa
- `DELETE /api/expenses/:id` - Deletar despesa
- `GET /api/expenses/by-category` - Despesas agrupadas por categoria

### Fornecedores (Fase 1)
- `GET /api/suppliers` - Lista de fornecedores
- `POST /api/suppliers` - Criar fornecedor
- `PUT /api/suppliers/:id` - Atualizar fornecedor
- `DELETE /api/suppliers/:id` - Deletar fornecedor
- `GET /api/suppliers/:id/products` - Produtos do fornecedor

### Break-even (Fase 1)
- `GET /api/break-even/analysis` - Análise de ponto de equilíbrio
- `GET /api/break-even/product/:productId` - Break-even de produto específico

### Outros
- `GET /api/categories` - Lista de categorias
- `GET /api/health` - Health check

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://challenge:challenge_2024@localhost:5433/challenge_db"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Cache (opcional)
CACHE_TTL=3600  # Tempo de vida do cache em segundos
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Analytics (opcional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:e2e
```

## 📚 Documentação Adicional

Para informações mais detalhadas, consulte:

- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Guia completo de configuração do backend
- **[IMPLEMENTACAO_BACKEND.md](IMPLEMENTACAO_BACKEND.md)** - Relatório técnico da implementação
- **[mvp_spec.md](mvp_spec.md)** - Especificação completa do MVP e features
- **[DATA_GENERATORS_GUIDE.md](DATA_GENERATORS_GUIDE.md)** - Comparação entre geradores de dados v1 (MVP) e v2 (Fase 1)
- **[START.md](START.md)** - Guia rápido de início
- **[backend/README.md](backend/README.md)** - Documentação detalhada da API

### Guias de Uso

#### Como usar o Query Builder
1. Acesse `/dashboard/query-builder`
2. **Use um template pronto** ou crie uma consulta do zero:
   - Templates disponíveis: Vendas, Produtos, Canais, Lojas
   - Cada template já vem com métricas e visualizações pré-configuradas
3. **Customize sua análise**:
   - Selecione métricas (ex: Receita Total, Ticket Médio, Margem de Lucro)
   - Escolha dimensões para agrupar (ex: Por Produto, Por Canal, Por Loja)
   - Configure filtros de data e outros critérios
4. Escolha o tipo de visualização (tabela, gráfico de barras/linhas/pizza, KPIs)
5. Exporte os dados em PDF, Excel ou CSV
6. Salve sua consulta para reutilização futura

#### Como adicionar novas métricas ao Query Builder
Edite [backend/src/services/QueryBuilderService.ts](backend/src/services/QueryBuilderService.ts) e adicione:
1. Nova métrica no método `getMetadata()`
2. Lógica de cálculo no método `executeQuery()`
3. Tradução PT-BR em [frontend/src/lib/translations.ts](frontend/src/lib/translations.ts)

## 📦 Build e Deploy

### Docker Production

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy Manual

**Backend:**
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 🎨 Customização

### Tema

O projeto usa Tailwind CSS com CSS variables para temas. Edite `frontend/src/app/globals.css` para customizar cores:

```css
:root {
  --color-primary: ...;
  --color-secondary: ...;
  /* ... */
}
```

### Componentes

Todos os componentes UI seguem o padrão shadcn/ui e podem ser customizados em `frontend/src/components/ui/`.

## 🔧 Troubleshooting

### Erro ao conectar com o banco de dados
```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Reinicie os serviços
docker-compose restart postgres
```

### Frontend não está se conectando ao backend
- Verifique se a variável `NEXT_PUBLIC_API_URL` está correta no `.env.local`
- Confirme que o backend está rodando na porta 3001
- Verifique se há erros CORS nos logs do backend

### Cache não está funcionando
```bash
# Verifique se o Redis está rodando
docker-compose ps redis

# Teste a conexão Redis
docker-compose exec redis redis-cli ping
# Deve retornar: PONG

# Limpe o cache
docker-compose exec redis redis-cli FLUSHALL
```

### Erro ao conectar com Redis (ioredis)
Se você ver erros relacionados ao ioredis:
```bash
# Verifique a variável REDIS_URL no .env do backend
# Deve ser: REDIS_URL="redis://localhost:6379"

# Reinicie o backend
docker-compose restart backend
```

### Erro ao gerar Prisma Client
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
```

### Queries muito lentas
- Verifique se o Redis está ativo e respondendo
- Considere limitar o range de datas nas consultas
- Use o Prisma Studio para verificar a quantidade de dados

## 🗺️ Roadmap

### ✅ Fase 1 - Concluída (Dezembro 2024 - Janeiro 2025)
- [x] Query Builder com sistema de tradução PT-BR
- [x] Dashboard Templates pré-configurados (vendas, produtos, canais, lojas)
- [x] Catálogo de Métricas com documentação
- [x] Módulo financeiro completo (custos, despesas, fornecedores)
- [x] Análise de rentabilidade por canal
- [x] Break-even analysis
- [x] Exportação premium (PDF, Excel, screenshots)
- [x] Custom dashboards com layouts draggable
- [x] Redis cache com ioredis
- [x] Refatoração de arquitetura de services
- [x] Otimização de performance e usabilidade

### 🚧 Próximas Fases (Planejado)
- [ ] **Fase 2**: Sistema de alertas e notificações
- [ ] **Fase 3**: Previsões e forecasting com ML
- [ ] **Fase 4**: Integração com sistemas de PDV
- [ ] **Fase 5**: App mobile (React Native)
- [ ] **Fase 6**: Módulo de gestão de estoque

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes para Contribuição
- Siga os padrões de código TypeScript/ESLint do projeto
- Adicione testes para novas funcionalidades
- Atualize a documentação relevante
- Use commits semânticos (feat:, fix:, docs:, etc.)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Thais Reis** - [ThaisFReis](https://github.com/ThaisFReis)

## 📊 Métricas do Projeto

### Backend
- **21 Models Prisma** com relações completas (incluindo 4 modelos financeiros da Fase 1)
- **40+ Endpoints REST** implementados e documentados
- **18 Controllers** organizados por domínio
- **18 Services** especializados com lógica de negócio:
  - 6 serviços core (dashboard, products, channels, stores, insights, reports)
  - 6 serviços financeiros (costs, expenses, financial, channel profitability, break-even, suppliers)
  - 4 serviços de infraestrutura (cache, Redis/ioredis, custom reports, templates)
  - 2 serviços de análise avançada (Query Builder, categories)
- **Cache Redis com ioredis** integrado com TTL estratégico por tipo de dado
- **Type-safe** com TypeScript em 100% do código
- **Validação robusta** com Zod em todos os endpoints

### Frontend
- **8 Páginas** principais de dashboard
- **70+ Componentes** reutilizáveis e modulares:
  - 12 componentes do Query Builder (incluindo templates e catálogo)
  - Componentes financeiros (Fase 1)
  - Componentes de insights e relatórios
  - shadcn/ui base components (Radix UI)
- **15+ Charts** interativos com Recharts
- **Sistema de tradução PT-BR** para campos técnicos do banco
- **4 Templates pré-configurados** para dashboards
- **Catálogo com 15+ métricas** documentadas
- **Responsive design** mobile-first com Tailwind CSS
- **Exportação premium**: PDF, Excel (XLSX), CSV e screenshots
- **Custom layouts** com react-grid-layout

### Performance
- ⚡ Dashboard carrega em **< 2s**
- ⚡ Queries com cache retornam em **< 100ms**
- ⚡ Cache hit ratio **> 80%** após warm-up
- ⚡ Suporta análise de **500k+ registros** eficientemente
- ⚡ Query Builder executa consultas customizadas em **< 500ms**

### Linhas de Código (aproximado)
- **Backend**: ~120,000 linhas (18 services + 18 controllers)
- **Frontend**: ~28,000 linhas (70+ componentes + 8 páginas)
- **Total**: ~148,000 linhas de código TypeScript/React

## 🙏 Agradecimentos

- Baseado no desafio [Nola God Level](https://github.com/lucasvieira94/nola-god-level)
- UI inspirada em componentes da [shadcn/ui](https://ui.shadcn.com/)
- Ícones por [Lucide](https://lucide.dev/)

## 📧 Contato

Para dúvidas ou sugestões, abra uma [issue](https://github.com/ThaisFReis/mise/issues) no GitHub.

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
