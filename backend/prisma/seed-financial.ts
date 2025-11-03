import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding financial data...');

  // 1. Criar fornecedores
  console.log('Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Atacadão Alimentos',
        contact: 'João Silva',
        email: 'contato@atacadao.com.br',
        phone: '(11) 98765-4321',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Distribuidora Carnes Premium',
        contact: 'Maria Santos',
        email: 'vendas@carnespremium.com',
        phone: '(11) 91234-5678',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Hortifruti São Paulo',
        contact: 'Pedro Oliveira',
        email: 'pedidos@hortifruti.com.br',
        phone: '(11) 99876-5432',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Laticínios Bom Leite',
        contact: 'Ana Paula',
        email: 'comercial@bomleite.com.br',
        phone: '(11) 97654-3210',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Embalagens Express',
        contact: 'Carlos Mendes',
        email: 'vendas@embalagemexpress.com',
        phone: '(11) 96543-2109',
      },
    }),
  ]);
  console.log(`✅ Created ${suppliers.length} suppliers`);

  // 2. Buscar produtos existentes para adicionar custos
  const products = await prisma.product.findMany({
    take: 50,
    include: { category: true },
  });

  if (products.length === 0) {
    console.log('⚠️ No products found. Please run the main seed first.');
    return;
  }

  // 3. Criar custos de produtos
  console.log('Creating product costs...');
  const productCosts = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  for (const product of products) {
    // Definir custo base baseado na categoria
    let baseCost = 10;
    const categoryName = product.category?.name.toLowerCase() || '';

    if (categoryName.includes('carne') || categoryName.includes('proteína')) {
      baseCost = 25 + Math.random() * 25; // R$ 25-50
    } else if (categoryName.includes('queijo') || categoryName.includes('laticínio')) {
      baseCost = 15 + Math.random() * 20; // R$ 15-35
    } else if (categoryName.includes('legume') || categoryName.includes('salada')) {
      baseCost = 5 + Math.random() * 10; // R$ 5-15
    } else if (categoryName.includes('bebida')) {
      baseCost = 3 + Math.random() * 7; // R$ 3-10
    } else {
      baseCost = 8 + Math.random() * 15; // R$ 8-23
    }

    // Criar histórico de custos (3-4 entradas por produto)
    for (let i = 0; i < Math.floor(Math.random() * 2) + 3; i++) {
      const monthsBack = i * 2;
      const validFrom = new Date(now);
      validFrom.setMonth(now.getMonth() - monthsBack);

      const validUntil = i === 0 ? null : new Date(validFrom);
      if (validUntil) {
        validUntil.setMonth(validFrom.getMonth() + 2);
      }

      // Variação de custo ao longo do tempo (+/- 10%)
      const costVariation = 1 + (Math.random() - 0.5) * 0.2;
      const cost = baseCost * costVariation * (1 + i * 0.03); // Inflação de 3% por período

      const productCost = await prisma.productCost.create({
        data: {
          productId: product.id,
          cost: parseFloat(cost.toFixed(2)),
          validFrom,
          validUntil,
          supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id,
          notes: i === 0 ? 'Custo atual' : `Custo histórico - ${monthsBack} meses atrás`,
        },
      });
      productCosts.push(productCost);
    }
  }
  console.log(`✅ Created ${productCosts.length} product costs`);

  // 4. Buscar lojas para adicionar despesas e custos fixos
  const stores = await prisma.store.findMany();

  if (stores.length === 0) {
    console.log('⚠️ No stores found. Please run the main seed first.');
    return;
  }

  // 5. Criar despesas operacionais
  console.log('Creating operating expenses...');
  const operatingExpenses = [];
  const categories = ['labor', 'rent', 'utilities', 'marketing', 'maintenance', 'other'];

  for (const store of stores) {
    // Criar despesas dos últimos 6 meses
    for (let monthBack = 0; monthBack < 6; monthBack++) {
      const period = new Date(now);
      period.setMonth(now.getMonth() - monthBack);
      period.setDate(1); // Primeiro dia do mês

      for (const category of categories) {
        let amount = 0;
        let description = '';

        switch (category) {
          case 'labor':
            amount = 15000 + Math.random() * 10000; // R$ 15k-25k
            description = 'Salários e encargos trabalhistas';
            break;
          case 'rent':
            amount = 6000 + Math.random() * 4000; // R$ 6k-10k
            description = 'Aluguel do espaço comercial';
            break;
          case 'utilities':
            amount = 2000 + Math.random() * 2000; // R$ 2k-4k
            description = 'Água, luz, gás e internet';
            break;
          case 'marketing':
            amount = 1000 + Math.random() * 3000; // R$ 1k-4k
            description = 'Publicidade e marketing digital';
            break;
          case 'maintenance':
            amount = 500 + Math.random() * 1500; // R$ 500-2k
            description = 'Manutenção de equipamentos e instalações';
            break;
          case 'other':
            amount = 800 + Math.random() * 1200; // R$ 800-2k
            description = 'Outras despesas operacionais';
            break;
        }

        const expense = await prisma.operatingExpense.create({
          data: {
            storeId: store.id,
            category,
            amount: parseFloat(amount.toFixed(2)),
            period,
            description,
          },
        });
        operatingExpenses.push(expense);
      }
    }
  }
  console.log(`✅ Created ${operatingExpenses.length} operating expenses`);

  // 6. Criar custos fixos
  console.log('Creating fixed costs...');
  const fixedCosts = [];

  for (const store of stores) {
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 12); // Começou há 1 ano

    const fixedCostData = [
      {
        name: 'Aluguel',
        amount: 6000 + Math.random() * 4000,
        frequency: 'monthly',
        description: 'Aluguel fixo do espaço comercial',
      },
      {
        name: 'Salários Fixos',
        amount: 12000 + Math.random() * 8000,
        frequency: 'monthly',
        description: 'Folha de pagamento fixa (gerente, cozinheiro chefe)',
      },
      {
        name: 'Seguro',
        amount: 800 + Math.random() * 500,
        frequency: 'monthly',
        description: 'Seguro do estabelecimento',
      },
      {
        name: 'Contador',
        amount: 1500 + Math.random() * 1000,
        frequency: 'monthly',
        description: 'Serviços contábeis',
      },
      {
        name: 'Licenças e Taxas',
        amount: 500 + Math.random() * 500,
        frequency: 'monthly',
        description: 'Alvará, taxa de funcionamento, etc',
      },
    ];

    for (const fixedCostItem of fixedCostData) {
      const fixedCost = await prisma.fixedCost.create({
        data: {
          storeId: store.id,
          name: fixedCostItem.name,
          amount: parseFloat(fixedCostItem.amount.toFixed(2)),
          frequency: fixedCostItem.frequency,
          startDate,
          description: fixedCostItem.description,
        },
      });
      fixedCosts.push(fixedCost);
    }
  }
  console.log(`✅ Created ${fixedCosts.length} fixed costs`);

  // 7. Buscar canais para adicionar comissões
  const channels = await prisma.channel.findMany();

  if (channels.length === 0) {
    console.log('⚠️ No channels found. Please run the main seed first.');
    return;
  }

  // 8. Criar comissões de canais
  console.log('Creating channel commissions...');
  const channelCommissions = [];

  for (const channel of channels) {
    let commissionRate = 0;
    let notes = '';

    const channelName = channel.name.toLowerCase();

    // Definir taxa de comissão baseada no tipo de canal
    if (channelName.includes('ifood')) {
      commissionRate = 27 + Math.random() * 5; // 27-32%
      notes = 'Comissão iFood - taxa padrão marketplace';
    } else if (channelName.includes('rappi')) {
      commissionRate = 25 + Math.random() * 5; // 25-30%
      notes = 'Comissão Rappi - taxa padrão marketplace';
    } else if (channelName.includes('uber') || channelName.includes('ubereats')) {
      commissionRate = 25 + Math.random() * 5; // 25-30%
      notes = 'Comissão Uber Eats - taxa padrão marketplace';
    } else if (channelName.includes('app') || channelName.includes('próprio')) {
      commissionRate = 5 + Math.random() * 5; // 5-10%
      notes = 'Comissão app próprio - taxa de processamento de pagamento';
    } else if (channelName.includes('telefone') || channelName.includes('tel')) {
      commissionRate = 3 + Math.random() * 3; // 3-6%
      notes = 'Taxa de processamento de pagamento';
    } else if (channel.type === 'P') {
      commissionRate = 2 + Math.random() * 3; // 2-5%
      notes = 'Taxa de processamento de pagamento (cartão)';
    } else {
      commissionRate = 15 + Math.random() * 10; // 15-25%
      notes = 'Taxa de intermediação';
    }

    // Criar histórico de comissões (2 entradas: antiga e atual)
    for (let i = 0; i < 2; i++) {
      const monthsBack = i * 6;
      const validFrom = new Date(now);
      validFrom.setMonth(now.getMonth() - monthsBack);

      const validUntil = i === 0 ? null : new Date(validFrom);
      if (validUntil) {
        validUntil.setMonth(validFrom.getMonth() + 6);
      }

      // Taxa antiga era um pouco menor
      const rate = i === 0 ? commissionRate : commissionRate * 0.9;

      const commission = await prisma.channelCommission.create({
        data: {
          channelId: channel.id,
          commissionRate: parseFloat(rate.toFixed(2)),
          validFrom,
          validUntil,
          notes: i === 0 ? notes : notes + ' (taxa antiga)',
        },
      });
      channelCommissions.push(commission);
    }
  }
  console.log(`✅ Created ${channelCommissions.length} channel commissions`);

  console.log('');
  console.log('🎉 Financial seed completed successfully!');
  console.log(`   - ${suppliers.length} suppliers`);
  console.log(`   - ${productCosts.length} product costs`);
  console.log(`   - ${operatingExpenses.length} operating expenses`);
  console.log(`   - ${fixedCosts.length} fixed costs`);
  console.log(`   - ${channelCommissions.length} channel commissions`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding financial data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
