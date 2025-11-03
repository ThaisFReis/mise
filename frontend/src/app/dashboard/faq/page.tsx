'use client'

import { useState } from 'react'
import { HelpCircle, Search, Sparkles, BookOpen, Database, Headphones, Wand2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: React.ElementType
  faqs: FAQItem[]
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories: FAQCategory[] = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: Sparkles,
      faqs: [
        {
          question: 'Como faço para começar a usar o Mise?',
          answer: 'Para começar, acesse o Dashboard principal que oferece uma visão geral das suas métricas mais importantes. Explore as diferentes seções no menu lateral: Dashboard, Query Builder, Produtos, Canais, Lojas e Insights. Recomendamos começar pelo Dashboard para familiarizar-se com os dados e depois explorar as análises específicas de acordo com sua necessidade.'
        },
        {
          question: 'Quais são as principais funcionalidades do Mise?',
          answer: 'O Mise oferece 6 módulos principais: (1) Dashboard - visão geral com KPIs em tempo real, (2) Query Builder - crie análises personalizadas sem código, (3) Produtos - explore a performance do seu cardápio, (4) Canais - compare vendas entre delivery e presencial, (5) Lojas - analise múltiplas unidades, e (6) Insights - descubra padrões automaticamente com heatmaps e análises temporais.'
        },
        {
          question: 'Preciso de conhecimento técnico para usar a plataforma?',
          answer: 'Não! O Mise foi projetado para ser intuitivo e fácil de usar. Todas as análises podem ser criadas através de interfaces visuais (arrastar e soltar), sem necessidade de escrever código ou conhecer SQL. O Query Builder permite criar análises complexas de forma simples e visual.'
        },
        {
          question: 'Como navego entre as diferentes seções?',
          answer: 'Use o menu lateral (sidebar) à esquerda da tela para navegar entre as seções principais. Você pode clicar nos ícones ou passar o mouse sobre eles para ver os nomes completos. O menu é responsivo e se adapta automaticamente a diferentes tamanhos de tela.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Funcionalidades',
      icon: BookOpen,
      faqs: [
        {
          question: 'O que posso ver no Dashboard principal?',
          answer: 'O Dashboard mostra KPIs essenciais como receita total, número de pedidos, ticket médio e taxa de cancelamento. Também exibe gráficos de vendas por hora, distribuição de receita por canal, performance de lojas e produtos mais vendidos. Todos os dados são atualizados em tempo real e respondem aos filtros de data aplicados.'
        },
        {
          question: 'Como funciona a análise de Produtos?',
          answer: 'A seção de Produtos permite explorar todo o seu cardápio com filtros por categoria (bebidas, sobremesas, principais, etc.) e canal de venda. Você pode ver métricas de quantidade vendida, receita gerada, ticket médio e nível de customização de cada produto. É possível ordenar por qualquer coluna e exportar os dados.'
        },
        {
          question: 'Qual a diferença entre análise de Canais e Lojas?',
          answer: 'A análise de Canais compara a performance entre diferentes meios de venda (iFood, Rappi, Uber Eats, presencial, etc.), mostrando horários de pico e produtos mais vendidos por canal. Já a análise de Lojas compara diferentes unidades físicas do seu restaurante, permitindo identificar quais lojas performam melhor e por quê.'
        },
        {
          question: 'O que são os Insights Inteligentes?',
          answer: 'A seção de Insights oferece análises automáticas e heatmaps que revelam padrões nos seus dados. Inclui heatmap de vendas por hora/dia da semana, análise temporal de produtos, comparação entre períodos, análise de horários de pico, distribuição de pedidos e métricas de performance. O sistema identifica automaticamente tendências importantes.'
        }
      ]
    },
    {
      id: 'query-builder',
      title: 'Query Builder',
      icon: Wand2,
      faqs: [
        {
          question: 'Como uso o Query Builder para criar análises personalizadas?',
          answer: 'No Query Builder, selecione as métricas que deseja analisar (receita, quantidade, ticket médio, etc.) e as dimensões para agrupar os dados (produto, canal, loja, hora, etc.). Escolha o período desejado, selecione o tipo de gráfico (barra, linha, pizza, área) e clique em "Executar Query". Você pode salvar suas análises favoritas para reutilizá-las depois.'
        },
        {
          question: 'Quais tipos de gráficos estão disponíveis?',
          answer: 'Oferecemos 4 tipos de gráficos: (1) Gráfico de Barras - ideal para comparar categorias, (2) Gráfico de Linhas - perfeito para tendências ao longo do tempo, (3) Gráfico de Pizza - mostra proporções e distribuições, e (4) Gráfico de Área - combina tendências com volume. O sistema sugere automaticamente o melhor tipo baseado nos dados selecionados.'
        },
        {
          question: 'Como salvo e reutilizo minhas queries?',
          answer: 'Após criar uma query, clique no botão "Salvar Query" e dê um nome descritivo. Suas queries salvas ficam disponíveis no menu suspenso "Queries Salvas" no topo da página. Você pode carregar, editar ou excluir queries salvas a qualquer momento. As queries são salvas localmente no seu navegador.'
        },
        {
          question: 'Posso exportar os resultados das minhas análises?',
          answer: 'Sim! Você pode exportar dados em múltiplos formatos: CSV (para análise em Excel/planilhas), Excel (.xlsx) com formatação preservada, PDF (relatório visual) e PNG (imagem do gráfico). Use o menu "Exportar" no canto superior direito da área de resultados.'
        },
        {
          question: 'O que são KPIs Cards no Query Builder?',
          answer: 'Os KPI Cards mostram resumos agregados dos seus dados selecionados, como total de receita, quantidade de itens, ticket médio e contagem de registros. Eles aparecem automaticamente acima dos gráficos e fornecem contexto numérico para a visualização.'
        }
      ]
    },
    {
      id: 'data-privacy',
      title: 'Dados e Privacidade',
      icon: Database,
      faqs: [
        {
          question: 'De onde vêm os dados exibidos na plataforma?',
          answer: 'Os dados são gerados a partir das operações do seu restaurante, incluindo pedidos de delivery (iFood, Rappi, Uber Eats), vendas presenciais e outras fontes integradas. O sistema processa automaticamente essas informações para criar as análises apresentadas.'
        },
        {
          question: 'Com que frequência os dados são atualizados?',
          answer: 'A plataforma trabalha com dados em tempo real. As métricas do Dashboard e outras seções são atualizadas automaticamente conforme novos pedidos são processados. Você pode usar os filtros de data para visualizar períodos específicos ou dados históricos.'
        },
        {
          question: 'Meus dados estão seguros?',
          answer: 'Sim, levamos a segurança dos dados muito a sério. Utilizamos criptografia para transmissão e armazenamento de dados, controles de acesso rigorosos e seguimos as melhores práticas de segurança da indústria. Seus dados de negócio são confidenciais e nunca compartilhados com terceiros.'
        },
        {
          question: 'Posso filtrar dados por período específico?',
          answer: 'Sim! Todas as seções possuem filtros de data que permitem selecionar períodos personalizados, datas específicas ou usar atalhos como "Últimos 7 dias", "Último mês", "Hoje", etc. Os dados e gráficos são atualizados automaticamente quando você altera os filtros.'
        },
        {
          question: 'Quanto tempo de histórico fica disponível?',
          answer: 'Mantemos todo o seu histórico de dados disponível para análise. Você pode consultar informações desde o início da operação do seu restaurante na plataforma, permitindo análises de tendências de longo prazo e comparações entre diferentes períodos.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Suporte Técnico',
      icon: Headphones,
      faqs: [
        {
          question: 'Quanto tempo leva para gerar uma análise?',
          answer: 'A maioria das análises é gerada instantaneamente (menos de 1 segundo). Mesmo queries complexas com grandes volumes de dados são processadas em menos de 500 milissegundos. Se você perceber lentidão, verifique sua conexão de internet ou tente atualizar a página.'
        },
        {
          question: 'A plataforma funciona em dispositivos móveis?',
          answer: 'Sim! O Mise é totalmente responsivo e funciona perfeitamente em smartphones e tablets. A interface se adapta automaticamente ao tamanho da tela, e todas as funcionalidades estão disponíveis em dispositivos móveis. Para melhor experiência em análises detalhadas, recomendamos usar um tablet ou desktop.'
        },
        {
          question: 'Quais navegadores são suportados?',
          answer: 'O Mise funciona em todos os navegadores modernos: Chrome, Firefox, Safari, Edge e Opera (versões recentes). Para melhor performance e compatibilidade, recomendamos manter seu navegador sempre atualizado. A plataforma usa tecnologias web modernas para garantir velocidade e responsividade.'
        },
        {
          question: 'Como reporto um problema ou sugiro melhorias?',
          answer: 'Entre em contato através do email contato@mise.app ou use o link "Suporte" no rodapé da página. Nossa equipe responde rapidamente e valorizamos todo feedback. Você também pode descrever detalhes do problema ou sugestão para nos ajudar a melhorar continuamente a plataforma.'
        },
        {
          question: 'Existe um tutorial ou guia de início rápido?',
          answer: 'Sim! O Query Builder possui um Guia de Início Rápido integrado com 3 passos para criar sua primeira análise. Além disso, muitos campos possuem tooltips informativos (ícone de "?" ao lado) que explicam cada funcionalidade. Esta página de FAQ também serve como documentação completa da plataforma.'
        },
        {
          question: 'Posso personalizar o tema da interface (claro/escuro)?',
          answer: 'Sim! Use o botão de tema (ícone de sol/lua) localizado na barra lateral inferior. A plataforma suporta tanto o modo claro quanto o modo escuro, e sua preferência é salva automaticamente. Ambos os temas foram cuidadosamente projetados para facilitar a leitura e análise dos dados.'
        }
      ]
    }
  ]

  // Filter FAQs based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return faqCategories

    return faqCategories.map(category => ({
      ...category,
      faqs: category.faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.faqs.length > 0)
  }

  const filteredCategories = getFilteredCategories()

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Perguntas Frequentes</h1>
            <p className="text-muted-foreground">
              Encontre respostas para as dúvidas mais comuns sobre o Mise
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar perguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Content */}
      <Card>
        <CardHeader>
          <CardTitle>Central de Ajuda</CardTitle>
          <CardDescription>
            Navegue pelas categorias abaixo ou use a busca para encontrar respostas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum resultado encontrado para "{searchQuery}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente usar termos diferentes ou navegue pelas categorias
              </p>
            </div>
          ) : (
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
                {filteredCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.title}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {filteredCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Contact Support Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            Ainda precisa de ajuda?
          </CardTitle>
          <CardDescription>
            Nossa equipe está pronta para ajudar você
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Se você não encontrou a resposta que procurava, entre em contato conosco.
            Respondemos rapidamente e teremos prazer em ajudar!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:contato@mise.app"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Enviar Email
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent hover:border-primary/50 transition-colors text-sm font-medium"
            >
              Ver Documentação
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
