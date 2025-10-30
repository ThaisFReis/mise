# Nola God Level - Backend API

Backend API para o desafio God Level Coder, construído com Node.js, Express, Prisma e Redis.

## Tecnologias

- **Node.js 20** com TypeScript
- **Express.js** - Framework web
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Cache layer
- **Docker** - Containerização

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (database, redis, env)
│   ├── controllers/     # Controllers das rotas
│   ├── services/        # Lógica de negócio
│   ├── routes/          # Definição de rotas
│   ├── middleware/      # Middleware (CORS, error handling)
│   ├── types/           # TypeScript types
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Prisma schema
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Setup Local

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
DATABASE_URL="postgresql://challenge:challenge_2024@localhost:5432/challenge_db"
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
CACHE_TTL=300
```

### 3. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 4. Conectar ao Banco Existente

Como o banco já foi criado via `database-schema.sql`, você pode fazer o pull do schema:

```bash
npm run prisma:pull
```

Ou se preferir usar migrations:

```bash
npm run prisma:migrate
```

### 5. Iniciar o Servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## Usando Docker

### Com Docker Compose (Recomendado)

Na raiz do projeto:

```bash
# Subir todos os serviços (postgres, redis, backend)
docker-compose up -d

# Ver logs do backend
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down
```

### Build Manual

```bash
cd backend
docker build -t nola-backend .
docker run -p 3001:3001 --env-file .env nola-backend
```

## Endpoints da API

### Base URL
`http://localhost:3001/api`

### Health Check
```
GET /api/health
```

### Dashboard
```
GET /api/dashboard/overview?startDate=2024-01-01&endDate=2024-12-31
GET /api/dashboard/top-products?startDate=2024-01-01&endDate=2024-12-31&limit=5
GET /api/dashboard/revenue-by-channel?startDate=2024-01-01&endDate=2024-12-31
GET /api/dashboard/revenue-by-hour?startDate=2024-01-01&endDate=2024-12-31
```

### Produtos
```
GET /api/products?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
GET /api/products/:id?startDate=2024-01-01&endDate=2024-12-31
GET /api/products/:id/customizations?startDate=2024-01-01&endDate=2024-12-31
```

### Canais
```
GET /api/channels/performance?startDate=2024-01-01&endDate=2024-12-31
```

### Lojas
```
GET /api/stores
GET /api/stores/performance?startDate=2024-01-01&endDate=2024-12-31
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento com hot reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:studio` - Abre Prisma Studio (GUI do banco)
- `npm run prisma:pull` - Puxa schema do banco existente
- `npm run prisma:push` - Envia schema para o banco

## Cache

O sistema usa Redis para cache com os seguintes TTLs:

- **Dashboard overview**: 5 minutos (300s)
- **Top products**: 10 minutos (600s)
- **Channel/Store performance**: 10 minutos (600s)
- **Product lists**: 10 minutos (600s)
- **Product customizations**: 15 minutos (900s)

## Troubleshooting

### Erro de conexão com PostgreSQL

Verifique se o PostgreSQL está rodando:
```bash
docker-compose ps postgres
```

Teste a conexão:
```bash
psql -h localhost -U challenge -d challenge_db
```

### Erro de conexão com Redis

Verifique se o Redis está rodando:
```bash
docker-compose ps redis
```

Teste a conexão:
```bash
redis-cli ping
```

### Prisma Client não encontrado

Regenere o Prisma Client:
```bash
npm run prisma:generate
```

### Porta 3001 já em uso

Altere a porta no `.env`:
```env
PORT=3002
```

## Desenvolvimento

### Adicionando Novos Endpoints

1. Crie o service em `src/services/`
2. Crie o controller em `src/controllers/`
3. Adicione as rotas em `src/routes/`
4. Importe as rotas em `src/routes/index.ts`

### Trabalhando com Prisma

```bash
# Visualizar dados
npm run prisma:studio

# Criar migration
npx prisma migrate dev --name migration_name

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

## Performance

- Queries otimizadas com índices apropriados
- Cache estratégico com Redis
- Paginação em endpoints de listagem
- Connection pooling do Prisma

## Segurança

- CORS configurado
- Validação de inputs
- Error handling centralizado
- Logs de requests
