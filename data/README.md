# Data Generator - God Level Challenge

Gerador de dados realistas para restaurantes baseado nos modelos do Arcca.

## Setup Rápido

1. **Copie e configure o .env:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o .env com suas credenciais do Railway:**
   ```env
   DATABASE_URL=postgresql://postgres:SUA_SENHA@hopper.proxy.rlwy.net:PORTA/railway
   ```

3. **Ative o ambiente virtual:**
   ```bash
   source venv/bin/activate
   ```

4. **Execute o gerador:**
   ```bash
   python generate_data.py
   ```

Pronto! O script vai usar as configurações do `.env` automaticamente.

## Uso

### Modo 1: Usando .env (Recomendado)

Configuração no `.env`:
```env
DATABASE_URL=postgresql://postgres:senha@host:porta/railway
MONTHS=6
STORES=50
PRODUCTS=500
ITEMS=200
CUSTOMERS=10000
```

Rodar:
```bash
python generate_data.py
```

### Modo 2: Argumentos CLI

```bash
python generate_data.py \
  --db-url "postgresql://postgres:senha@host:porta/railway" \
  --months 6 \
  --stores 50 \
  --products 500 \
  --items 200 \
  --customers 10000
```

### Modo 3: Misto (CLI sobrescreve .env)

```bash
# Usa DATABASE_URL do .env, mas gera apenas 1 mês
python generate_data.py --months 1
```

## Testes

Testar conexão com o banco:
```bash
python test_connection.py
```

Ou com URL específica:
```bash
python test_connection.py "postgresql://user:pass@host:port/db"
```

## Otimizações Implementadas

✅ Batch inserts (10-50x mais rápido)
✅ Cache de payment_types (elimina queries repetidas)
✅ Progress tracking com ETA
✅ Suporte a .env para facilitar uso

## Estrutura de Dados Gerada

- **Base**: Marcas, sub-marcas, canais, tipos de pagamento
- **Lojas**: 50 lojas (default) com coordenadas brasileiras
- **Produtos**: 500 produtos em 6 categorias
- **Items**: 200 items/complementos em 3 categorias
- **Clientes**: 10,000 clientes com dados brasileiros
- **Vendas**: 6 meses (default) com padrões realistas:
  - Horários de pico (almoço 11-15h, jantar 19-23h)
  - Fins de semana mais movimentados
  - Anomalias (semanas ruins, dias promocionais)
  - Customizações de produtos
  - Dados de delivery completos

## Performance

Com as otimizações implementadas:
- **~450-600 sales/segundo** para Railway
- **6 meses de dados**: ~15-25 minutos
- **1 mês de dados**: ~3-5 minutos (recomendado para testes)

## Troubleshooting

### Erro de conexão
```
connection to server failed
```
**Solução**: Verifique se as credenciais no Railway mudaram. A porta e senha podem mudar após restart do serviço.

### Script travando
```
^CKeyboardInterrupt
```
**Solução**: Já corrigido! As otimizações implementadas eliminam este problema.

### Tabelas não existem
```
ERROR: relation "brands" does not exist
```
**Solução**: Execute as migrations do Prisma ou aplique o `database-schema.sql` antes de rodar o gerador.
