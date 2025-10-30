# 🍽️ Mise - Restaurant Analytics Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)

**Mise** é uma plataforma completa de análise de dados para restaurantes, oferecendo insights detalhados sobre vendas, produtos, canais e performance operacional. Desenvolvida com tecnologias modernas e foco em performance e experiência do usuário.

## 📸 Screenshots

### Dashboard Principal
Visão geral com métricas principais, vendas por hora e distribuição por canal.

### Análise de Canais
Compare a performance entre diferentes canais de venda (delivery, presencial, etc.).

### Explorador de Produtos
Análise detalhada do cardápio com métricas de vendas, customizações e combinações.

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

### 🎯 Recursos Adicionais
- **Filtros globais**: Data range e seleção de lojas sincronizados em todas as páginas
- **Tema escuro/claro**: Interface adaptável às preferências do usuário
- **Cache inteligente**: Redis para consultas rápidas e eficientes
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🛠️ Tecnologias

### Backend
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Express](https://expressjs.com/)** - Framework web minimalista
- **[Prisma](https://www.prisma.io/)** - ORM moderno
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Redis](https://redis.io/)** - Cache em memória
- **[Docker](https://www.docker.com/)** - Containerização

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React com SSR
- **[React 18](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI reutilizáveis
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos
- **[React Query](https://tanstack.com/query)** - Gerenciamento de estado server
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management

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
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Backend API (porta 3001)
- Frontend (porta 3000)

### 4. Configure o Banco de Dados

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed  # Opcional: dados de exemplo
```

### 5. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api-docs (se habilitado)

## 📁 Estrutura do Projeto

```
mise/
├── backend/                    # API REST
│   ├── src/
│   │   ├── controllers/       # Controladores de rotas
│   │   ├── services/          # Lógica de negócio
│   │   ├── routes/            # Definição de rotas
│   │   ├── middleware/        # Middlewares customizados
│   │   ├── config/            # Configurações (DB, cache, etc)
│   │   ├── types/             # TypeScript types
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   └── package.json
│
├── frontend/                   # Aplicação Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 13+)
│   │   │   ├── dashboard/     # Páginas do dashboard
│   │   │   │   ├── page.tsx           # Dashboard principal
│   │   │   │   ├── channels/          # Análise de canais
│   │   │   │   └── products/          # Explorador de produtos
│   │   │   └── layout.tsx
│   │   ├── components/        # Componentes React
│   │   │   ├── charts/        # Gráficos (Recharts)
│   │   │   ├── dashboard/     # Componentes específicos
│   │   │   ├── layout/        # Sidebar, Header
│   │   │   └── ui/            # Componentes base (shadcn/ui)
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilitários e API client
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── docker-compose.yml         # Configuração Docker
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

### Outros
- `GET /api/stores` - Lista de lojas
- `GET /api/categories` - Lista de categorias
- `GET /api/health` - Health check

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mise"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"
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

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Thais Reis** - [ThaisFReis](https://github.com/ThaisFReis)

## 🙏 Agradecimentos

- Baseado no desafio [Nola God Level](https://github.com/lucasvieira94/nola-god-level)
- UI inspirada em componentes da [shadcn/ui](https://ui.shadcn.com/)
- Ícones por [Lucide](https://lucide.dev/)

## 📧 Contato

Para dúvidas ou sugestões, abra uma [issue](https://github.com/ThaisFReis/mise/issues) no GitHub.

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
