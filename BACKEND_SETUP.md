# Backend Setup - Guia Rápido

O backend foi criado com sucesso! Aqui está um guia rápido para começar.

## Estrutura Criada

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Prisma client
│   │   ├── redis.ts         # Redis client
│   │   └── env.ts           # Environment config
│   ├── controllers/
│   │   ├── dashboardController.ts
│   │   ├── productController.ts
│   │   ├── channelController.ts
│   │   └── storeController.ts
│   ├── services/
│   │   ├── cacheService.ts
│   │   ├── dashboardService.ts
│   │   ├── productService.ts
│   │   ├── channelService.ts
│   │   └── storeService.ts
│   ├── routes/
│   │   ├── dashboard.ts
│   │   ├── products.ts
│   │   ├── channels.ts
│   │   ├── stores.ts
│   │   └── index.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts            # Entry point
├── prisma/
│   └── schema.prisma        # Database schema (21 models)
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env
├── .env.example
└── README.md
```

## Como Iniciar

### Opção 1: Docker (Recomendado)

Na raiz do projeto:

```bash
# 1. Subir todos os serviços (PostgreSQL + Redis + Backend)
docker-compose up -d

# 2. Verificar logs
docker-compose logs -f backend

# 3. Gerar dados de teste (se ainda não gerou)
docker-compose --profile tools run data-generator
```

O backend estará disponível em: `http://localhost:3001/api`

### Opção 2: Local (sem Docker)

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Gerar Prisma Client
npm run prisma:generate

# 3. Verificar se PostgreSQL e Redis estão rodando
docker-compose up -d postgres redis

# 4. Iniciar o servidor
npm run dev
```

## Testando a API

### Health Check

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Dashboard Overview

```bash
curl "http://localhost:3001/api/dashboard/overview?startDate=2024-01-01&endDate=2024-12-31"
```

### Top 5 Produtos

```bash
curl "http://localhost:3001/api/dashboard/top-products?startDate=2024-01-01&endDate=2024-12-31&limit=5"
```

### Lista de Produtos

```bash
curl "http://localhost:3001/api/products?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20"
```

### Performance de Canais

```bash
curl "http://localhost:3001/api/channels/performance?startDate=2024-01-01&endDate=2024-12-31"
```

### Performance de Lojas

```bash
curl "http://localhost:3001/api/stores/performance?startDate=2024-01-01&endDate=2024-12-31"
```

## Endpoints Implementados

### Dashboard
- `GET /api/dashboard/overview` - Métricas principais
- `GET /api/dashboard/top-products` - Top produtos
- `GET /api/dashboard/revenue-by-channel` - Receita por canal
- `GET /api/dashboard/revenue-by-hour` - Receita por hora

### Produtos
- `GET /api/products` - Lista de produtos com paginação
- `GET /api/products/:id` - Detalhes de um produto
- `GET /api/products/:id/customizations` - Customizações de um produto

### Canais
- `GET /api/channels/performance` - Performance dos canais

### Lojas
- `GET /api/stores` - Lista de lojas
- `GET /api/stores/performance` - Performance das lojas

## Recursos Implementados

### Cache com Redis
- TTL configurável (padrão: 5-15 minutos)
- Cache automático em todas as queries complexas
- Invalidação inteligente por padrão

### Queries Otimizadas
- Uso de `$queryRaw` para queries complexas
- Agregações eficientes
- Joins otimizados

### Error Handling
- Middleware centralizado de erros
- Validação de parâmetros
- Mensagens de erro claras

### CORS
- Configurado para aceitar requisições do frontend (localhost:3000)
- Credentials habilitado

## Tecnologias Utilizadas

- **Node.js 20** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Database ORM com type-safety
- **PostgreSQL** - Database relacional
- **Redis** - Cache layer
- **date-fns** - Manipulação de datas
- **Zod** - Validação (preparado para uso)

## Próximos Passos

1. **Gerar dados de teste** (se ainda não fez):
   ```bash
   docker-compose --profile tools run data-generator
   ```

2. **Conectar o frontend**:
   - O frontend já está configurado para usar `http://localhost:3001/api`
   - Basta iniciar ambos os serviços

3. **Testar os endpoints**:
   - Use Postman, Insomnia ou curl
   - Ou acesse direto pelo frontend quando estiver rodando

4. **Explorar com Prisma Studio**:
   ```bash
   cd backend
   npm run prisma:studio
   ```
   - Abre uma interface web em `http://localhost:5555`
   - Visualize e edite dados diretamente

## Troubleshooting

### Porta 3001 já em uso
```bash
# Altere no backend/.env
PORT=3002
```

### Erro de conexão com PostgreSQL
```bash
# Verifique se está rodando
docker-compose ps postgres

# Veja os logs
docker-compose logs postgres
```

### Erro de conexão com Redis
```bash
# Verifique se está rodando
docker-compose ps redis

# Reinicie o Redis
docker-compose restart redis
```

### Prisma Client desatualizado
```bash
cd backend
npm run prisma:generate
```

## Monitoramento

### Ver logs do backend
```bash
docker-compose logs -f backend
```

### Ver todos os containers
```bash
docker-compose ps
```

### Parar todos os serviços
```bash
docker-compose down
```

### Parar e remover volumes (CUIDADO: apaga dados)
```bash
docker-compose down -v
```

## Performance

O backend está otimizado para:
- **< 1s** para queries simples
- **< 2s** para dashboard completo
- Cache efetivo reduz carga no banco
- Connection pooling automático do Prisma

## Segurança

- Validação de inputs
- CORS configurado
- Error handling sem expor detalhes internos
- Logs estruturados
- Environment variables para configurações sensíveis

---

**Tudo pronto para começar! 🚀**

Se tiver dúvidas, consulte o [README do backend](backend/README.md) para mais detalhes.
