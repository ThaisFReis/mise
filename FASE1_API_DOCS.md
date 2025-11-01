# 📡 API Documentation - Phase 1: Financial Analysis

## Base URL
```
http://localhost:3000/api
```

---

## 🏷️ Cost Management

### Product Costs

#### Create/Update Product Cost
```http
POST /costs/products
Content-Type: application/json

{
  "productId": 1,
  "cost": 25.50,
  "validFrom": "2025-11-01T00:00:00Z",
  "validUntil": null,
  "supplierId": 1,
  "notes": "Novo custo do fornecedor X"
}
```

#### Get Current Product Cost
```http
GET /costs/products/:productId
```

#### Get Cost History
```http
GET /costs/products/:productId/history
```

#### Delete Product Cost
```http
DELETE /costs/products/:costId
```

#### Bulk Import Costs
```http
POST /costs/products/bulk
Content-Type: application/json

{
  "costs": [
    {
      "productId": 1,
      "cost": 25.50,
      "validFrom": "2025-11-01T00:00:00Z",
      "supplierId": 1
    },
    // ... more costs
  ]
}
```

### COGS (Cost of Goods Sold)

#### Calculate COGS
```http
GET /costs/cogs?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "total": 45000,
    "byCategory": [
      {
        "categoryId": 1,
        "categoryName": "Proteínas",
        "total": 20250,
        "percentage": 45
      }
    ],
    "byProduct": [...],
    "trends": {
      "currentMonth": 45000,
      "previousMonth": 42000,
      "variance": 3000,
      "percentageChange": 7.14
    }
  }
}
```

### Prime Cost

#### Calculate Prime Cost
```http
GET /costs/prime-cost?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "cogs": 45000,
    "labor": 20000,
    "primeCost": 65000,
    "primeCostPercentage": 43.3,
    "revenue": 150000,
    "status": "healthy",
    "benchmark": {
      "ideal": "55-65%",
      "current": 43.3
    }
  }
}
```

### Fixed Costs

#### List Fixed Costs
```http
GET /costs/fixed?storeId=1&activeOnly=true
```

#### Create Fixed Cost
```http
POST /costs/fixed
Content-Type: application/json

{
  "storeId": 1,
  "name": "Aluguel",
  "amount": 6000,
  "frequency": "monthly",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": null,
  "description": "Aluguel fixo mensal"
}
```

#### Get Monthly Fixed Costs
```http
GET /costs/fixed/monthly?storeId=1&referenceDate=2025-11-01
```

---

## 👥 Supplier Management

#### List All Suppliers
```http
GET /suppliers

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Atacadão Alimentos",
      "contact": "João Silva",
      "email": "contato@atacadao.com",
      "phone": "(11) 98765-4321",
      "_count": {
        "productCosts": 25
      }
    }
  ],
  "count": 5
}
```

#### Get Supplier by ID
```http
GET /suppliers/:id
```

#### Create Supplier
```http
POST /suppliers
Content-Type: application/json

{
  "name": "Distribuidora ABC",
  "contact": "Maria Santos",
  "email": "maria@abc.com",
  "phone": "(11) 91234-5678"
}
```

#### Update Supplier
```http
PUT /suppliers/:id
```

#### Delete Supplier
```http
DELETE /suppliers/:id
```

#### Get Supplier Products
```http
GET /suppliers/:id/products
```

#### Search Suppliers
```http
GET /suppliers/search?query=atacadao
```

---

## 💰 Expense Management

### Operating Expenses

#### List Operating Expenses
```http
GET /expenses/operating?storeId=1&category=labor&startDate=2025-10-01&endDate=2025-10-31&limit=50&offset=0

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Operating Expense
```http
POST /expenses/operating
Content-Type: application/json

{
  "storeId": 1,
  "category": "labor",
  "amount": 15000,
  "period": "2025-10-01T00:00:00Z",
  "description": "Salários outubro"
}
```

Categories: `labor`, `rent`, `utilities`, `marketing`, `maintenance`, `other`

#### Update Operating Expense
```http
PUT /expenses/operating/:id
```

#### Delete Operating Expense
```http
DELETE /expenses/operating/:id
```

#### Get Expense Summary
```http
GET /expenses/operating/summary?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "total": 35000,
    "byCategory": [
      {
        "category": "labor",
        "categoryLabel": "Mão de Obra",
        "total": 20000,
        "percentage": 57.14,
        "count": 1
      }
    ],
    "byMonth": [...],
    "trends": {
      "currentMonth": 35000,
      "previousMonth": 33000,
      "variance": 2000,
      "percentageChange": 6.06
    }
  }
}
```

---

## 📊 Financial Analysis

### DRE (Income Statement)

#### Generate DRE
```http
GET /financial/dre?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "dre": {
      "period": {
        "start": "2025-10-01",
        "end": "2025-10-31"
      },
      "grossRevenue": 150000,
      "grossRevenueByChannel": [...],
      "deductions": {
        "discounts": 3000,
        "cancellations": 2000,
        "total": 5000
      },
      "netRevenue": 145000,
      "cogs": {
        "total": 45000,
        "byCategory": [...]
      },
      "grossProfit": 100000,
      "grossMargin": 68.97,
      "operatingExpenses": {
        "labor": 20000,
        "rent": 6000,
        "utilities": 3000,
        "marketing": 2000,
        "maintenance": 1000,
        "other": 3000,
        "total": 35000
      },
      "operatingProfit": 65000,
      "channelCommissions": {
        "byChannel": [...],
        "total": 15000
      },
      "netProfit": 50000,
      "netMargin": 34.48,
      "primeCost": {
        "value": 65000,
        "percentage": 44.83,
        "status": "healthy"
      }
    },
    "insights": [
      "✅ EXCELENTE: Margem líquida de 34.5% está acima da média do setor.",
      "💰 OPORTUNIDADE: Comissões representam 10.0% da receita..."
    ]
  }
}
```

#### Compare DRE Periods
```http
GET /financial/dre/compare?storeId=1&period1Start=2025-10-01&period1End=2025-10-31&period2Start=2025-09-01&period2End=2025-09-30

Response:
{
  "success": true,
  "data": {
    "current": { ... },
    "comparison": { ... },
    "variance": {
      "grossRevenue": {
        "value": 10000,
        "percentage": 7.14
      },
      "netProfit": {
        "value": 5000,
        "percentage": 11.11
      },
      ...
    }
  }
}
```

### Channel Profitability

#### Analyze All Channels
```http
GET /financial/channel-profitability?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "channels": [
      {
        "channelId": 1,
        "channelName": "Presencial",
        "channelType": "P",
        "grossRevenue": 60000,
        "commissionRate": 2.5,
        "commissions": 1500,
        "netRevenue": 58500,
        "cogs": 15000,
        "contributionMargin": 43500,
        "contributionRate": 72.5,
        "orderCount": 800,
        "avgTicket": 75,
        "profitPerOrder": 54.38
      },
      {
        "channelId": 2,
        "channelName": "iFood",
        "channelType": "D",
        "grossRevenue": 50000,
        "commissionRate": 30,
        "commissions": 15000,
        "netRevenue": 35000,
        "cogs": 12500,
        "contributionMargin": 22500,
        "contributionRate": 45,
        "orderCount": 650,
        "avgTicket": 76.92,
        "profitPerOrder": 34.62
      }
    ],
    "summary": {
      "totalGrossRevenue": 150000,
      "totalCommissions": 26200,
      "totalNetRevenue": 123800,
      "totalContributionMargin": 86300,
      "avgContributionRate": 57.5,
      "totalOrders": 1970
    },
    "insights": [
      {
        "type": "warning",
        "message": "iFood gera 33.3% da receita, mas tem margem de apenas 45.0% devido às altas comissões (30.0%)...",
        "channelId": 2
      },
      {
        "type": "opportunity",
        "message": "Presencial tem margem de 72.5%, a melhor entre todos os canais...",
        "channelId": 1
      }
    ]
  }
}
```

#### Analyze Single Channel
```http
GET /financial/channel-profitability?storeId=1&channelId=2&startDate=2025-10-01&endDate=2025-10-31
```

### Break-Even Analysis

#### Calculate Break-Even
```http
GET /financial/break-even?storeId=1&period=2025-10-01

Response:
{
  "success": true,
  "data": {
    "fixedCosts": 40000,
    "variableCostRate": 35,
    "contributionMarginRate": 65,
    "breakEvenRevenue": 61538.46,
    "breakEvenUnits": 821,
    "avgTicket": 75,
    "currentRevenue": 85000,
    "currentProgress": 138.1,
    "remainingRevenue": 0,
    "estimatedDate": "2025-10-18T00:00:00Z",
    "projections": {
      "pessimistic": {
        "date": "2025-10-31",
        "revenue": 110000
      },
      "realistic": {
        "date": "2025-10-31",
        "revenue": 130000
      },
      "optimistic": {
        "date": "2025-10-31",
        "revenue": 150000
      }
    }
  }
}
```

#### Get Daily Progress
```http
GET /financial/break-even/progress?storeId=1&period=2025-10-01

Response:
{
  "success": true,
  "data": {
    "breakEven": { ... },
    "dailyProgress": [
      {
        "date": "2025-10-01",
        "dailyRevenue": 3500,
        "accumulatedRevenue": 3500,
        "breakEvenProgress": 5.69
      },
      {
        "date": "2025-10-02",
        "dailyRevenue": 4200,
        "accumulatedRevenue": 7700,
        "breakEvenProgress": 12.51
      },
      ...
    ]
  }
}
```

### Dashboard Summary

#### Get Complete Dashboard
```http
GET /financial/dashboard?storeId=1&startDate=2025-10-01&endDate=2025-10-31

Response:
{
  "success": true,
  "data": {
    "period": { "start": "2025-10-01", "end": "2025-10-31" },
    "summary": {
      "netRevenue": 145000,
      "netProfit": 50000,
      "netMargin": 34.48,
      "grossProfit": 100000,
      "grossMargin": 68.97,
      "primeCost": {
        "value": 65000,
        "percentage": 44.83,
        "status": "healthy"
      },
      "breakEven": {
        "target": 61538.46,
        "current": 85000,
        "progress": 138.1,
        "status": "achieved"
      }
    },
    "dre": { ... },
    "channelProfitability": {
      "channels": [ ... top 5 ... ],
      "summary": { ... }
    },
    "insights": {
      "dre": [ ... ],
      "channels": [ ... ]
    }
  }
}
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // For validation errors
}
```

### Validation Error
```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": "body.storeId",
      "message": "Expected number, received string"
    }
  ]
}
```

---

## 🔐 Authentication

Currently not implemented. Add authentication middleware before production.

---

## 📈 Status Codes

- `200` - Success
- `201` - Created
- `207` - Multi-Status (bulk operations with partial failures)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## 💡 Tips

### Date Formats
All dates should be in ISO 8601 format:
```
2025-10-01T00:00:00Z
2025-10-31T23:59:59Z
```

### Pagination
Most list endpoints support pagination:
```
?limit=50&offset=0
```

### Filtering
Common filters:
- `storeId` - Filter by store
- `startDate` / `endDate` - Date range
- `category` - Expense category
- `activeOnly` - Active items only

---

## 🚀 Quick Start Examples

### 1. Calculate DRE for Current Month
```bash
curl -X GET "http://localhost:3000/api/financial/dre?storeId=1&startDate=2025-11-01&endDate=2025-11-30"
```

### 2. Check Break-Even Status
```bash
curl -X GET "http://localhost:3000/api/financial/break-even?storeId=1"
```

### 3. Analyze Channel Performance
```bash
curl -X GET "http://localhost:3000/api/financial/channel-profitability?storeId=1&startDate=2025-11-01&endDate=2025-11-30"
```

### 4. Get Complete Dashboard
```bash
curl -X GET "http://localhost:3000/api/financial/dashboard?storeId=1&startDate=2025-11-01&endDate=2025-11-30"
```

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
**Phase:** 1 - Financial Analysis
