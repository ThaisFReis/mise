# 🚀 Como Iniciar o Projeto - Guia Rápido

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (se for rodar localmente)

---

## Início Rápido (3 comandos)

```bash
# 1. Subir banco de dados, Redis e backend
docker-compose up -d

# 2. Gerar dados de teste (primeira vez)
docker-compose --profile tools run data-generator

# 3. Acessar a API
curl http://localhost:3001/api/health
```

**Pronto! API rodando em:** `http://localhost:3001/api`

---

## Estrutura de Serviços

Após executar `docker-compose up -d`, você terá:

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| **PostgreSQL** | 5432 | `localhost:5432` | Banco de dados |
| **Redis** | 6379 | `localhost:6379` | Cache |
| **Backend API** | 3001 | `http://localhost:3001/api` | API REST |
| **pgAdmin** | 5050 | `http://localhost:5050` | GUI do banco (opcional) |

---

## Comandos Úteis

### Ver logs do backend
```bash
docker-compose logs -f backend
```

### Ver status dos containers
```bash
docker-compose ps
```

### Parar todos os serviços
```bash
docker-compose down
```

### Reiniciar apenas o backend
```bash
docker-compose restart backend
```

### Acessar shell do container
```bash
docker-compose exec backend sh
```

---

## Testando a API

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Dashboard Overview
```bash
curl "http://localhost:3001/api/dashboard/overview?startDate=2024-01-01&endDate=2024-12-31"
```

### 3. Top 5 Produtos
```bash
curl "http://localhost:3001/api/dashboard/top-products?startDate=2024-01-01&endDate=2024-12-31&limit=5"
```

### 4. Lista de Lojas
```bash
curl http://localhost:3001/api/stores
```

---

## Desenvolvimento Local (sem Docker)

### Backend

```bash
# 1. Entrar no diretório
cd backend

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Subir apenas banco e Redis
cd ..
docker-compose up -d postgres redis

# 5. Iniciar backend
cd backend
npm run dev
```

### Frontend (quando estiver pronto)

```bash
# 1. Entrar no diretório
cd frontend

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

**Frontend estará em:** `http://localhost:3000`

---

## Visualizar Dados (Prisma Studio)

```bash
cd backend
npm run prisma:studio
```

**Abre GUI em:** `http://localhost:5555`

---

## Gerar Dados de Teste

### Opção 1: Via Docker (Recomendado)
```bash
docker-compose --profile tools run data-generator
```

### Opção 2: Local (Python)
```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar gerador
cd data
python generate_data.py
```

---

## Troubleshooting

### Backend não inicia

**Verificar logs:**
```bash
docker-compose logs backend
```

**Possíveis problemas:**
- PostgreSQL não está pronto → aguarde 10-20s
- Redis não está rodando → `docker-compose restart redis`
- Porta 3001 em uso → altere no `backend/.env`

### Erro de conexão com o banco

**Verificar se PostgreSQL está rodando:**
```bash
docker-compose ps postgres
```

**Testar conexão:**
```bash
docker-compose exec postgres psql -U challenge -d challenge_db -c "SELECT 1"
```

### Cache não funciona

**Verificar Redis:**
```bash
docker-compose exec redis redis-cli ping
# Deve retornar: PONG
```

### Prisma Client desatualizado

```bash
cd backend
npm run prisma:generate
```

---

## Acessar o Banco Diretamente

### Via Docker
```bash
docker-compose exec postgres psql -U challenge -d challenge_db
```

### Via pgAdmin

1. Acesse `http://localhost:5050`
2. Login: `admin@godlevel.com` / Senha: `admin`
3. Adicione servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `challenge_db`
   - Username: `challenge`
   - Password: `challenge_2024`

---

## Estrutura de Pastas

```
nola-god-level/
├── backend/              ← API REST com Prisma
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/             ← Next.js (se houver)
├── data/                 ← Scripts de geração de dados
├── docker-compose.yml    ← Orquestração de serviços
└── database-schema.sql   ← Schema SQL original
```

---

## Documentação Adicional

- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Setup detalhado do backend
- **[IMPLEMENTACAO_BACKEND.md](IMPLEMENTACAO_BACKEND.md)** - Relatório completo
- **[backend/README.md](backend/README.md)** - Documentação técnica do backend
- **[mvp_spec.md](mvp_spec.md)** - Especificação do MVP

---

## Endpoints Principais

### Dashboard
- `GET /api/dashboard/overview`
- `GET /api/dashboard/top-products`
- `GET /api/dashboard/revenue-by-channel`
- `GET /api/dashboard/revenue-by-hour`

### Produtos
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/customizations`

### Canais
- `GET /api/channels/performance`

### Lojas
- `GET /api/stores`
- `GET /api/stores/performance`

**Todos os endpoints requerem parâmetros `startDate` e `endDate`** (exceto `/api/stores`)

---

## Status do Projeto

- ✅ Backend implementado
- ✅ Prisma ORM configurado
- ✅ 14+ endpoints funcionais
- ✅ Cache com Redis
- ✅ Docker Compose configurado
- ✅ Documentação completa
- 🔄 Frontend (em desenvolvimento)

---

## Próximos Passos

1. ✅ Backend está pronto
2. ⏭️ Gerar dados de teste
3. ⏭️ Testar endpoints
4. ⏭️ Desenvolver/Conectar frontend
5. ⏭️ Adicionar novos recursos

---

**🎉 Tudo pronto! Bom desenvolvimento!**

Se precisar de ajuda:
- Verifique a documentação em `backend/README.md`
- Execute o script de verificação: `cd backend && ./verify.sh`
- Consulte os logs: `docker-compose logs -f`
