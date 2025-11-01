# 📊 Guia dos Geradores de Dados

Este projeto possui dois geradores de dados Python para popular o banco de dados com informações realistas de restaurantes.

---

## 🆚 Comparação: generate_data.py vs generate_data_v2.py

| Recurso | generate_data.py (MVP) | generate_data_v2.py (Phase 1) |
|---------|------------------------|-------------------------------|
| **Propósito** | Dados do MVP original | MVP + Dados Financeiros Fase 1 |
| **Vendas** | ✅ Sim | ✅ Sim |
| **Produtos** | ✅ Sim | ✅ Sim |
| **Clientes** | ✅ Sim | ✅ Sim |
| **Canais** | ✅ Sim | ✅ Sim |
| **Fornecedores** | ❌ Não | ✅ **Sim (5 fornecedores)** |
| **Custos de Produtos** | ❌ Não | ✅ **Sim (6 meses histórico)** |
| **Despesas Operacionais** | ❌ Não | ✅ **Sim (6 categorias)** |
| **Custos Fixos** | ❌ Não | ✅ **Sim (5 tipos)** |
| **Comissões de Canal** | ❌ Não | ✅ **Sim (histórico)** |
| **Padrões de Variação** | ❌ Não | ✅ **Sim (4 padrões)** |

---

## 📋 generate_data.py (MVP Original)

### O que gera:
- ✅ Brands e Sub-brands
- ✅ Lojas (stores) com localização
- ✅ Canais de venda (presencial, iFood, Rappi, etc)
- ✅ Produtos e categorias
- ✅ Itens (complementos/adicionais)
- ✅ Clientes
- ✅ Vendas completas com:
  - Product sales
  - Payments
  - Delivery data
  - Customizações

### Quando usar:
- ✅ Para testar o MVP básico de vendas
- ✅ Quando você **NÃO precisa** de dados financeiros
- ✅ Para demonstrações simples de dashboard de vendas

### Como usar:
```bash
python generate_data.py \
  --stores 50 \
  --products 500 \
  --customers 10000 \
  --months 6
```

### Exemplo de output:
```
✓ 50 stores created
✓ 500 products created
✓ 10,000 customers created
✓ 486,000 sales generated
```

---

## 🆕 generate_data_v2.py (Fase 1 Completo)

### O que gera:

**Tudo do MVP original MAIS:**

#### 1. **Fornecedores (Suppliers)**
```
5 fornecedores com:
- Nome realista (ex: "Atacadão São Paulo LTDA")
- Contato, email, telefone
- Criação há 1-2 anos
```

#### 2. **Custos de Produtos (Product Costs)**
```
Histórico de 6 meses com:
- Custo base: 30-40% do preço de venda
- 4 padrões de variação:
  • stable: variação de ±5%
  • increasing: aumento de 0-15%
  • decreasing: redução de 15%
  • volatile: variação de ±20%
- Relação com fornecedor
- Notas (10% têm motivo da variação)
```

#### 3. **Despesas Operacionais (Operating Expenses)**
```
6 categorias × lojas × meses:
- labor (mão de obra): R$ 15k-35k/mês
- rent (aluguel): R$ 5k-15k/mês
- utilities (utilidades): R$ 2k-6k/mês
- marketing: R$ 1k-5k/mês
- maintenance (manutenção): R$ 500-3k/mês
- other (outras): R$ 1k-4k/mês

Variação mensal: ±15%
```

#### 4. **Custos Fixos (Fixed Costs)**
```
5 tipos por loja:
- Aluguel (monthly): R$ 5k-15k
- Salários Fixos (monthly): R$ 10k-25k
- Seguro (annual): R$ 3k-8k
- Contabilidade (monthly): R$ 500-2k
- Sistema POS (monthly): R$ 200-800
```

#### 5. **Comissões de Canal (Channel Commissions)**
```
Histórico de taxas:
- iFood: 27% (taxa antiga) → 27-32% (atual)
- Rappi: 25% (antiga) → 23-27% (atual)
- Uber Eats: 30% (antiga) → 28-32% (atual)
- Outros: 0%

Mudança de taxa há 3 meses
```

### Quando usar:
- ✅ Para testar **TODA a Fase 1** (Análise Financeira)
- ✅ Quando você precisa de:
  - Cálculo de CMV (COGS)
  - Prime Cost
  - DRE completo
  - Lucratividade por canal
  - Break-even analysis
- ✅ Para demonstrações completas do sistema financeiro

### Como usar:
```bash
python generate_data_v2.py \
  --stores 50 \
  --products 500 \
  --customers 10000 \
  --suppliers 5 \
  --months 6
```

### Exemplo de output:
```
OPERATIONAL DATA:
  Stores: 50
  Products: 500
  Customers: 10,000
  Sales: 486,000

FINANCIAL DATA (Phase 1):
  Suppliers: 5
  Product Costs (historical): 3,000
  Operating Expenses: 18,000
  Fixed Costs: 250
  Channel Commissions: 12
```

---

## 🎯 Qual usar para Fase 1?

### ✅ **Recomendado: generate_data_v2.py**

Use o V2 porque ele gera TODOS os dados necessários para testar a Fase 1 completa:

```bash
# 1. Gerar TODOS os dados (MVP + Financeiro)
python generate_data_v2.py --stores 50 --months 6

# Pronto! Você tem tudo:
# ✅ Vendas, produtos, clientes (MVP)
# ✅ Custos, fornecedores, despesas (Fase 1)
```

### ⚠️ Alternativa: generate_data.py + seed-financial.ts

Se você quiser manter os scripts separados:

```bash
# 1. Gerar dados do MVP
python generate_data.py --stores 50 --months 6

# 2. Adicionar dados financeiros via Prisma seed
cd backend
npx prisma db seed
```

**Desvantagem:** Dois comandos em vez de um.

---

## 📊 Estatísticas dos Dados Gerados

### Com generate_data_v2.py (--stores 50 --months 6):

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| **sales** | ~486,000 | Vendas de 6 meses |
| **product_sales** | ~1,215,000 | Itens vendidos |
| **customers** | 10,000 | Base de clientes |
| **products** | 500 | Menu de produtos |
| **suppliers** | 5 | Fornecedores |
| **product_costs** | 3,000 | 500 produtos × 6 meses |
| **operating_expenses** | 18,000 | 50 lojas × 6 categorias × 6 meses |
| **fixed_costs** | 250 | 50 lojas × 5 tipos |
| **channel_commissions** | 12 | 6 canais × 2 períodos |

**Total:** ~1,730,000 registros

---

## 🚀 Guia Rápido de Uso

### Primeira vez (banco vazio):
```bash
# Usar V2 para ter tudo
python generate_data_v2.py --months 6
```

### Resetar banco e gerar novamente:
```bash
# 1. Limpar banco
cd backend
npx prisma migrate reset --force

# 2. Gerar dados novos
cd ..
python generate_data_v2.py --months 6
```

### Apenas adicionar mais vendas (sem resetar):
```bash
# Gerar mais 3 meses de vendas
python generate_data_v2.py --months 3
```

### Personalizar volumes:
```bash
python generate_data_v2.py \
  --stores 100 \       # Mais lojas
  --products 1000 \    # Mais produtos
  --customers 50000 \  # Mais clientes
  --suppliers 10 \     # Mais fornecedores
  --months 12          # Mais histórico
```

---

## 📈 Padrões de Variação de Custos (V2)

O generate_data_v2.py usa 4 padrões realistas:

### 1. **Stable** (40% dos produtos)
```
Variação: ±5%
Ex: Carne → R$ 25.00 → R$ 24.50 → R$ 25.80 → R$ 25.20
```

### 2. **Increasing** (25% dos produtos)
```
Tendência de alta: 0-15%
Ex: Salmão → R$ 40.00 → R$ 42.00 → R$ 45.00 → R$ 46.50
Motivo: Alta demanda, importação
```

### 3. **Decreasing** (15% dos produtos)
```
Tendência de baixa: -15%
Ex: Tomate → R$ 5.00 → R$ 4.80 → R$ 4.50 → R$ 4.30
Motivo: Safra, promoção atacadista
```

### 4. **Volatile** (20% dos produtos)
```
Oscilação: ±20%
Ex: Bacon → R$ 18.00 → R$ 21.00 → R$ 15.50 → R$ 19.80
Motivo: Mercado, câmbio, fornecedor
```

---

## 🆕 Bulk Import (Upload de Planilha)

O frontend da Fase 1 incluirá componentes para upload em massa:

### Templates disponíveis:
1. **Custos de Produtos** (ProductCosts.xlsx)
2. **Fornecedores** (Suppliers.xlsx)
3. **Despesas Operacionais** (OperatingExpenses.xlsx)
4. **Custos Fixos** (FixedCosts.xlsx)

### Formato dos templates:
```
| ProductID | Cost  | ValidFrom  | ValidUntil | SupplierID | Notes          |
|-----------|-------|------------|------------|------------|----------------|
| 1         | 25.50 | 2025-01-01 | 2025-02-01 | 1          | Reajuste Q1    |
| 2         | 12.80 | 2025-01-01 |            | 2          | Preço fixo     |
```

---

## 🎓 Dicas

### Performance
- Para grandes volumes (100+ lojas, 12+ meses), execute durante a noite
- Monitore o uso de memória (PostgreSQL pode precisar de mais RAM)
- Use `--batch-size` maior se tiver RAM disponível

### Desenvolvimento
- Use `--months 3` para testes rápidos
- Use `--months 12` para análises completas de tendência
- Sempre rode após `prisma migrate reset` para dados limpos

### Produção
- **NUNCA** rode geradores em produção
- Use migrations e seeds para dados iniciais
- Dados de produção devem vir de integrações reais

---

## ❓ FAQ

**P: Qual é mais rápido?**
R: Ambos são similares (~5-10 min para 6 meses). O V2 adiciona apenas 30s-1min para dados financeiros.

**P: Posso rodar os dois?**
R: Não recomendado. Use apenas o V2 para evitar duplicação.

**P: E se eu já tenho vendas do V1?**
R: Rode `prisma migrate reset` e use o V2 do zero.

**P: Como sei se preciso de dados financeiros?**
R: Se você vai testar DRE, Prime Cost, Break-even → use o V2.

**P: Os custos são realistas?**
R: Sim! Baseados em 30-40% do preço de venda (margem saudável 60-70%).

---

## 📞 Suporte

**Problemas?**
1. Verifique conexão com PostgreSQL
2. Confirme que o schema está atualizado (`prisma db push`)
3. Veja logs de erro detalhados no console
4. Abra issue no repositório

**Contribuindo:**
- Adicione novos padrões de variação em `COST_VARIATION_PATTERNS`
- Melhore nomes de fornecedores em `SUPPLIER_NAMES`
- Ajuste ranges de despesas em `BASE_EXPENSES`

---

**Criado para:** Nola God Level Challenge - Fase 1
**Última atualização:** 2025-01-11
**Versão:** 2.0
