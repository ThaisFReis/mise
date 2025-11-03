'use client';

import { useState } from 'react';
import { X, Lightbulb, TrendingUp, BarChart3, PieChart, Minimize2, Maximize2, ChevronDown, ChevronUp, MousePointer2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickStartGuideProps {
  onClose: () => void;
  onLoadExample: (example: 'sales-by-channel' | 'top-products' | 'store-comparison') => void;
  isMinimized: boolean;
  onMinimize: (minimized: boolean) => void;
}

interface ExampleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  preview: string;
  steps: string[];
  onClick: () => void;
}

function ExampleCard({ title, description, icon: Icon, preview, steps, onClick }: ExampleCardProps) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <Card className="p-4 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Preview Visual */}
      <div className="bg-accent/30 rounded-lg p-3 mb-3 border border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-2">Resultado:</p>
        <div className="text-xs text-foreground whitespace-pre-line">{preview}</div>
      </div>

      {/* Como Fazer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowSteps(!showSteps);
        }}
        className="w-full flex items-center justify-between text-xs text-primary hover:text-primary/80 transition-colors mb-2"
      >
        <span className="font-medium">Como fazer</span>
        {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showSteps && (
        <div className="bg-primary/5 rounded-lg p-3 mb-3 space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2 text-xs">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                {index + 1}
              </span>
              <p className="text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={onClick}
        size="sm"
        className="w-full text-xs bg-primary hover:bg-primary/90 transition-all duration-300"
      >
        <MousePointer2 className="w-3 h-3 mr-1.5" />
        Criar esta análise
      </Button>
    </Card>
  );
}

export function QuickStartGuide({ onClose, onLoadExample, isMinimized, onMinimize }: QuickStartGuideProps) {
  // Se minimizado, mostrar apenas botão flutuante
  if (isMinimized) {
    return (
      <button
        onClick={() => onMinimize(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center"
        title="Abrir guia de ajuda"
      >
        <Lightbulb className="w-6 h-6" />
      </button>
    );
  }

  const examples = [
    {
      title: 'Vendas por Canal',
      description: 'Compare quanto você vendeu em cada canal de venda',
      icon: BarChart3,
      preview: '📊 Gráfico de Barras\niFood: R$ 45.230\nRappi: R$ 32.150\nBalcão: R$ 28.900',
      steps: [
        'Selecione a métrica "Total de Vendas"',
        'Selecione a dimensão "Canal"',
        'Clique em "Executar"',
        'Escolha visualização "Barras"'
      ],
      onClick: () => onLoadExample('sales-by-channel')
    },
    {
      title: 'Produtos Mais Vendidos',
      description: 'Veja quais produtos têm maior saída',
      icon: TrendingUp,
      preview: '📋 Tabela Ordenada\n1. Pizza Margherita - 234 uni\n2. Hambúrguer Bacon - 189 uni\n3. Refrigerante - 156 uni',
      steps: [
        'Selecione "Quantidade" e "Total de Vendas"',
        'Selecione a dimensão "Produto"',
        'Clique em "Executar"',
        'Dados já vêm ordenados'
      ],
      onClick: () => onLoadExample('top-products')
    },
    {
      title: 'Comparar Lojas',
      description: 'Analise a performance de cada loja',
      icon: PieChart,
      preview: '🍰 Gráfico de Rosca\nLoja Centro: 35%\nLoja Norte: 28%\nLoja Sul: 37%',
      steps: [
        'Selecione "Total de Vendas" e "Pedidos"',
        'Selecione a dimensão "Loja"',
        'Clique em "Executar"',
        'Escolha visualização "Rosca"'
      ],
      onClick: () => onLoadExample('store-comparison')
    }
  ];

  return (
    <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-gray-soft">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Bem-vindo ao Construtor de Consultas!</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onMinimize(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Crie análises personalizadas dos seus dados em 3 passos simples:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="flex gap-3 items-start bg-card rounded-lg p-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            1
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Escolha Métricas</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              O que medir
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start bg-card rounded-lg p-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            2
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Escolha Dimensões</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Como agrupar (opcional)
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start bg-card rounded-lg p-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            3
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Clique Executar</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Veja os resultados
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>📌</span>
          Exemplos prontos para você começar:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <ExampleCard key={index} {...example} />
          ))}
        </div>
      </div>
    </Card>
  );
}
