'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Wand2,
  Package,
  TrendingUp,
  Store,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Clock,
  Target,
  Zap,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  features: string[];
  gradient: string;
}

function FeatureCard({ title, description, icon: Icon, href, features, gradient }: FeatureCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(href)}
      className="group p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
    >
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>

      <ul className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all"
        variant="outline"
      >
        Explorar
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

export default function HomePage() {
  const features = [
    {
      title: 'Dashboard',
      description: 'Veja o pulso do seu restaurante em tempo real',
      icon: BarChart3,
      href: '/dashboard',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      features: [
        'KPIs de receita, pedidos e cancelamentos',
        'Tendências de vendas por hora',
        'Distribuição por canal de venda',
        'Produtos mais vendidos'
      ]
    },
    {
      title: 'Query Builder',
      description: 'Crie análises personalizadas sem código',
      icon: Wand2,
      href: '/dashboard/query-builder',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      features: [
        'Arraste e solte métricas e dimensões',
        'Múltiplos tipos de gráficos',
        'Filtros de data e período',
        'Exporte para CSV ou PNG'
      ]
    },
    {
      title: 'Explorador de Produtos',
      description: 'Analise a performance do seu cardápio',
      icon: Package,
      href: '/dashboard/products',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      features: [
        'Filtragem por categoria e canal',
        'Análise de customizações',
        'Ordenação por performance',
        'Exportação de relatórios'
      ]
    },
    {
      title: 'Análise de Canais',
      description: 'Compare performance entre canais de venda',
      icon: TrendingUp,
      href: '/dashboard/channels',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      features: [
        'Métricas por canal (iFood, Rappi, etc)',
        'Horários de pico por canal',
        'Timeline de vendas',
        'Produtos top por canal'
      ]
    },
    {
      title: 'Performance de Lojas',
      description: 'Compare suas unidades e otimize operações',
      icon: Store,
      href: '/dashboard/stores',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      features: [
        'Comparação entre localizações',
        'Ranking de performance',
        'Distribuição de receita',
        'Produtos destaque por loja'
      ]
    },
    {
      title: 'Insights Inteligentes',
      description: 'Descubra padrões automaticamente',
      icon: Lightbulb,
      href: '/dashboard/insights',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      features: [
        'Heatmaps de vendas',
        'Auto-insights de padrões',
        'Comparação entre períodos',
        '6+ relatórios rápidos'
      ]
    }
  ];

  const quickStats = [
    {
      icon: Zap,
      label: 'Análises Instantâneas',
      description: 'Resultados em tempo real'
    },
    {
      icon: Target,
      label: 'Decisões Baseadas em Dados',
      description: 'Insights acionáveis'
    },
    {
      icon: Clock,
      label: 'Economize Tempo',
      description: 'Automatize relatórios'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Plataforma de Analytics para Restaurantes
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Bem-vindo ao <span className="text-primary">Mise</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Transforme dados do seu restaurante em decisões inteligentes.
              Analytics poderoso, sem complexidade.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore Todas as Funcionalidades
          </h2>
          <p className="text-muted-foreground text-lg">
            Clique em qualquer card para começar a explorar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-primary/5 to-background border-t border-border">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <Card className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Como Começar
              </h2>
              <p className="text-muted-foreground">
                Siga estes passos para aproveitar ao máximo a plataforma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold text-foreground mb-2">Explore o Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Comece com a visão geral para entender suas métricas principais
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold text-foreground mb-2">Analise Detalhes</h3>
                <p className="text-sm text-muted-foreground">
                  Use as páginas específicas para investigar produtos, canais e lojas
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold text-foreground mb-2">Crie Análises Customizadas</h3>
                <p className="text-sm text-muted-foreground">
                  Use o Query Builder para criar suas próprias análises sem código
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                onClick={() => window.location.href = '/dashboard'}
              >
                Começar Agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Perguntas Frequentes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dúvidas Comuns
          </h2>
          <p className="text-muted-foreground text-lg">
            Respostas rápidas para as perguntas mais frequentes
          </p>
        </div>

        <Card className="border-2">
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Como faço para começar a usar o Mise?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Para começar, acesse o Dashboard principal que oferece uma visão geral das suas métricas mais importantes.
                    Explore as diferentes seções no menu lateral: Dashboard, Query Builder, Produtos, Canais, Lojas e Insights.
                    Recomendamos começar pelo Dashboard para familiarizar-se com os dados.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Como uso o Query Builder para criar análises personalizadas?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    No Query Builder, selecione as métricas que deseja analisar (receita, quantidade, ticket médio, etc.)
                    e as dimensões para agrupar os dados (produto, canal, loja, hora, etc.). Escolha o período desejado,
                    selecione o tipo de gráfico e clique em "Executar Query". Você pode salvar suas análises favoritas para reutilizá-las depois.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Posso exportar os resultados das minhas análises?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Sim! Você pode exportar dados em múltiplos formatos: CSV (para análise em Excel/planilhas),
                    Excel (.xlsx) com formatação preservada, PDF (relatório visual) e PNG (imagem do gráfico).
                    Use o menu "Exportar" no canto superior direito da área de resultados.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Meus dados estão seguros?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Sim, levamos a segurança dos dados muito a sério. Utilizamos criptografia para transmissão e armazenamento de dados,
                    controles de acesso rigorosos e seguimos as melhores práticas de segurança da indústria.
                    Seus dados de negócio são confidenciais e nunca compartilhados com terceiros.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  A plataforma funciona em dispositivos móveis?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Sim! O Mise é totalmente responsivo e funciona perfeitamente em smartphones e tablets.
                    A interface se adapta automaticamente ao tamanho da tela, e todas as funcionalidades estão disponíveis em dispositivos móveis.
                    Para melhor experiência em análises detalhadas, recomendamos usar um tablet ou desktop.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Posso personalizar o tema da interface?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Sim! Use o botão de tema (ícone de sol/lua) localizado na barra lateral inferior.
                    A plataforma suporta tanto o modo claro quanto o modo escuro, e sua preferência é salva automaticamente.
                    Ambos os temas foram cuidadosamente projetados para facilitar a leitura e análise dos dados.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.location.href = '/dashboard/faq'}
          >
            Ver Todas as Perguntas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
