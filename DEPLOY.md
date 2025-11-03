# Guia de Deploy - Nola God Level

Este guia contém instruções detalhadas para fazer deploy da aplicação no Railway (backend) e Vercel (frontend).

## Índice
- [Pré-requisitos](#pré-requisitos)
- [Deploy do Backend (Railway)](#deploy-do-backend-railway)
- [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

- Conta no [Railway](https://railway.app/)
- Conta no [Vercel](https://vercel.com/)
- CLI do Railway (opcional): `npm i -g @railway/cli`
- CLI do Vercel (opcional): `npm i -g vercel`
- Repositório Git (GitHub, GitLab ou Bitbucket)

## Deploy do Backend (Railway)

### Opção 1: Deploy via Interface Web

1. **Acesse o Railway**
   - Vá para https://railway.app/
   - Faça login com sua conta

2. **Crie um Novo Projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Configure o Serviço do Backend**
   - Railway detectará automaticamente o Dockerfile
   - Ou use as configurações em `railway.json` ou `railway.toml`

4. **Adicione o PostgreSQL**
   - No projeto, clique em "+ New"
   - Selecione "Database" → "PostgreSQL"
   - Railway criará um banco automaticamente

5. **Adicione o Redis**
   - No projeto, clique em "+ New"
   - Selecione "Database" → "Redis"
   - Railway criará um Redis automaticamente

6. **Configure as Variáveis de Ambiente**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://seu-app.vercel.app
   ```

7. **Deploy**
   - Railway fará o deploy automaticamente após o push
   - Aguarde o build completar
   - Anote a URL do backend (ex: `https://seu-backend.railway.app`)

### Opção 2: Deploy via CLI

```bash
# Instale o Railway CLI
npm i -g @railway/cli

# Faça login
railway login

# Inicialize o projeto
railway init

# Link ao projeto existente (se já criado)
railway link

# Adicione PostgreSQL
railway add --database postgresql

# Adicione Redis
railway add --database redis

# Configure as variáveis de ambiente
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set CORS_ORIGIN=https://seu-app.vercel.app

# Faça o deploy
railway up
```

## Deploy do Frontend (Vercel)

### Opção 1: Deploy via Interface Web

1. **Acesse a Vercel**
   - Vá para https://vercel.com/
   - Faça login com sua conta

2. **Importe o Projeto**
   - Clique em "Add New" → "Project"
   - Selecione seu repositório
   - Configure o projeto:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
     - **Install Command**: `npm install`

3. **Configure as Variáveis de Ambiente**
   - Vá para "Settings" → "Environment Variables"
   - Adicione:
     ```
     NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
     ```

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Sua aplicação estará disponível em `https://seu-app.vercel.app`

### Opção 2: Deploy via CLI

```bash
# Instale o Vercel CLI
npm i -g vercel

# Navegue até a pasta do frontend
cd frontend

# Faça login
vercel login

# Primeiro deploy (modo interativo)
vercel

# Siga as instruções:
# - Set up and deploy: Yes
# - Which scope: Sua conta
# - Link to existing project: No
# - Project name: nola-god-level-frontend
# - Directory: ./
# - Override settings: No

# Configure variáveis de ambiente
vercel env add NEXT_PUBLIC_API_URL production

# Deploy para produção
vercel --prod
```

## Configuração de Variáveis de Ambiente

### Backend (Railway)

Variáveis obrigatórias:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seu-app.vercel.app
```

Variáveis opcionais:
```bash
CACHE_TTL=300
```

### Frontend (Vercel)

Variáveis obrigatórias:
```bash
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

## Pós-Deploy

### 1. Atualizar CORS no Backend

Depois de fazer o deploy do frontend, atualize a variável `CORS_ORIGIN` no Railway com a URL real da Vercel:

```bash
# Via CLI
railway variables set CORS_ORIGIN=https://seu-app.vercel.app

# Ou via interface web no painel do Railway
```

### 2. Executar Migrações do Prisma

Se você tiver migrações pendentes, execute:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Ou adicione um comando de inicialização no Dockerfile
```

### 3. Popular o Banco de Dados (Opcional)

Se você quiser popular o banco com dados de exemplo:

```bash
# Via Railway CLI
railway run python generate_data.py --db-url $DATABASE_URL
```

## Troubleshooting

### Backend não conecta ao banco

- Verifique se a variável `DATABASE_URL` está configurada corretamente
- Certifique-se de que o serviço PostgreSQL está rodando
- Verifique os logs: `railway logs`

### Frontend não conecta ao backend

- Verifique se `NEXT_PUBLIC_API_URL` está configurada
- Certifique-se de que o CORS está permitindo a origem do frontend
- Verifique se a URL do backend está acessível

### Build falha no Railway

- Verifique os logs de build: `railway logs --build`
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Dockerfile está correto

### Build falha na Vercel

- Verifique os logs na interface da Vercel
- Certifique-se de que o Root Directory está definido como `frontend`
- Verifique se todas as variáveis de ambiente necessárias estão configuradas

### Redis não conecta

- Verifique se a variável `REDIS_URL` está configurada
- Certifique-se de que o serviço Redis está rodando no Railway
- Verifique os logs para erros de conexão

## Comandos Úteis

### Railway

```bash
# Ver logs em tempo real
railway logs

# Ver variáveis de ambiente
railway variables

# Abrir dashboard
railway open

# Executar comando no container
railway run <comando>
```

### Vercel

```bash
# Ver logs
vercel logs

# Ver variáveis de ambiente
vercel env ls

# Remover deploy
vercel remove <deployment-url>

# Abrir dashboard
vercel inspect
```

## Deploy Automático

Ambas as plataformas suportam deploy automático via Git:

- **Railway**: Faz deploy automaticamente a cada push na branch principal
- **Vercel**: Faz deploy automaticamente a cada push (produção na main, preview nas outras branches)

Para desabilitar o deploy automático, acesse as configurações do projeto em cada plataforma.

## Monitoramento

### Railway
- Acesse o dashboard para ver métricas de CPU, memória e logs
- Configure alertas em Settings → Notifications

### Vercel
- Acesse Analytics para ver métricas de performance
- Acesse Logs para ver logs em tempo real
- Configure webhooks para notificações

## Custos

### Railway
- Plano gratuito: $5 de crédito por mês
- PostgreSQL e Redis consomem créditos baseado em uso
- Monitorar uso em Settings → Usage

### Vercel
- Plano gratuito: 100GB de bandwidth
- Build minutes: 6000 minutos/mês
- Serverless function executions: 100GB-hrs

## Segurança

- Nunca commite arquivos `.env` com secrets
- Use variáveis de ambiente para todos os valores sensíveis
- Ative HTTPS (Railway e Vercel fazem isso automaticamente)
- Configure CORS apropriadamente
- Use senhas fortes para banco de dados
- Habilite autenticação de dois fatores nas contas Railway e Vercel

## Suporte

- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Documentação Railway: https://docs.railway.app/
- Documentação Vercel: https://vercel.com/docs
