'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, ChevronRight, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Dados da documentação (extraídos do DOCUMENTACAO_TECNICA.md)
const documentationData = {
  title: "Documentação Técnica - Mise: Restaurant Analytics Platform",
  sections: [ 
    {
      id: "overview",
      title: "1. Visão Geral do Projeto",
      subsections: [
        { id: "context", title: "1.1 Contexto e Problema" },
        { id: "solution", title: "1.2 Proposta de Solução" },
        { id: "summary", title: "1.3 Resumo Executivo" }
      ]
    },
    {
      id: "architecture",
      title: "2. Arquitetura da Solução",
      subsections: [
        { id: "overview", title: "2.1 Visão Geral da Arquitetura" },
        { id: "components", title: "2.2 Diagrama de Componentes" },
        { id: "flow", title: "2.3 Fluxo de Dados" },
        { id: "decisions", title: "2.4 Decisões Arquiteturais" }
      ]
    },
    {
      id: "stack",
      title: "3. Stack Tecnológico",
      subsections: [
        { id: "backend", title: "3.1 Backend" },
        { id: "frontend", title: "3.2 Frontend" },
        { id: "devops", title: "3.3 DevOps" },
        { id: "justifications", title: "3.4 Justificativas das Escolhas" }
      ]
    },
    {
      id: "features",
      title: "4. Funcionalidades Principais",
      subsections: [
        { id: "query-builder", title: "4.1 Query Builder (No-Code Analytics)" },
        { id: "dashboards", title: "4.2 Dashboards Pré-configurados" },
        { id: "export", title: "4.3 Sistema de Exportação" },
        { id: "cache", title: "4.4 Sistema de Cache Inteligente" }
      ]
    },
    {
      id: "data-model",
      title: "5. Modelo de Dados",
      subsections: [
        { id: "entities", title: "5.1 Entidades Principais" },
        { id: "relationships", title: "5.2 Relacionamentos" },
        { id: "indexes", title: "5.3 Índices e Otimizações" },
        { id: "diagram", title: "5.4 Diagrama ER Completo" }
      ]
    },
    {
      id: "api",
      title: "6. API REST",
      subsections: [
        { id: "structure", title: "6.1 Estrutura de Endpoints" },
        { id: "query-builder-api", title: "6.2 Query Builder API" },
        { id: "dashboard-api", title: "6.3 Dashboard API" },
        { id: "products-api", title: "6.4 Produtos API" },
        { id: "channels-api", title: "6.5 Canais API" },
        { id: "stores-api", title: "6.6 Lojas API" },
        { id: "insights-api", title: "6.7 Insights API" },
        { id: "reports-api", title: "6.8 Reports API" },
        { id: "financial-api", title: "6.9 Financial API" },
        { id: "costs-api", title: "6.10 Costs & Expenses API" },
        { id: "suppliers-api", title: "6.11 Suppliers API" },
        { id: "patterns", title: "6.12 Padrões de Resposta" }
      ]
    },
    {
      id: "performance",
      title: "7. Performance e Escalabilidade",
      subsections: [
        { id: "cache-strategy", title: "7.1 Estratégia de Cache" },
        { id: "query-optimization", title: "7.2 Otimizações de Queries" },
        { id: "metrics", title: "7.3 Métricas de Performance" },
        { id: "scaling", title: "7.4 Pontos de Atenção para Escala" }
      ]
    },
    {
      id: "security",
      title: "8. Segurança",
      subsections: [
        { id: "current-state", title: "8.1 Estado Atual" },
        { id: "roadmap", title: "8.2 Roadmap de Segurança" }
      ]
    },
    {
      id: "setup",
      title: "9. Guia de Instalação e Deploy",
      subsections: [
        { id: "prerequisites", title: "9.1 Pré-requisitos" },
        { id: "docker-setup", title: "9.2 Setup Local com Docker" },
        { id: "manual-setup", title: "9.3 Setup Manual (sem Docker)" },
        { id: "data-generation", title: "9.4 Geração de Dados de Teste" },
        { id: "build", title: "9.5 Build para Produção" },
        { id: "deploy", title: "9.6 Deploy" },
        { id: "troubleshooting", title: "9.7 Troubleshooting" }
      ]
    },
    {
      id: "decisions",
      title: "10. Decisões Técnicas",
      subsections: [
        { id: "query-builder-vs-sql", title: "10.1 Por que Query Builder ao invés de SQL direto?" },
        { id: "prisma-vs-orm", title: "10.2 Por que Prisma ao invés de TypeORM ou Sequelize?" },
        { id: "nextjs-15", title: "10.3 Por que Next.js 15 App Router?" },
        { id: "redis-cache", title: "10.4 Por que Redis para Cache?" },
        { id: "recharts", title: "10.5 Por que Recharts para Visualização?" },
        { id: "trade-offs", title: "10.6 Trade-offs e Limitações Conhecidas" }
      ]
    },
    {
      id: "roadmap",
      title: "11. Roadmap",
      subsections: [
        { id: "phase1", title: "11.1 Fase 1 - Concluída ✅" },
        { id: "phase2", title: "11.2 Fase 2 - Alertas e Notificações" },
        { id: "phase3", title: "11.3 Fase 3 - Machine Learning e Forecasting" },
        { id: "phase4", title: "11.4 Fase 4 - Integrações com PDV" },
        { id: "phase5", title: "11.5 Fase 5 - App Mobile" }
      ]
    },
    {
      id: "metrics",
      title: "12. Métricas do Projeto",
      subsections: [
        { id: "code", title: "12.1 Código" },
        { id: "features", title: "12.2 Funcionalidades" },
        { id: "performance", title: "12.3 Performance" },
        { id: "tests", title: "12.4 Testes" }
      ]
    }
  ]
};

interface Section {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  // Load markdown content
  useEffect(() => {
    fetch('/DOCUMENTACAO_TECNICA.md')
      .then(response => response.text())
      .then(content => setMarkdownContent(content))
      .catch(error => console.error('Error loading documentation:', error));
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSelectedSection(sectionId);
    }
  };

  const handleIndexClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setTimeout(() => scrollToSection(sectionId), 100);
    setIsMobileMenuOpen(false);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const filteredSections = documentationData.sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subsections?.some(sub => sub.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Documentação Técnica</h1>
                <p className="text-sm text-muted-foreground">Mise - Restaurant Analytics Platform</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <Card className="p-4 sticky top-24">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar na documentação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Navigation */}
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-2">
                    {filteredSections.map((section) => (
                      <div key={section.id} className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto text-left"
                          onClick={() => {
                            if (!expandedSections.has(section.id)) {
                              toggleSection(section.id);
                            }
                            toggleSection(section.id);
                            handleIndexClick(section.id);
                          }}
                        >
                          <span className="text-sm font-medium">{section.title}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.has(section.id) ? 'rotate-90' : ''
                            }`}
                          />
                        </Button>

                        {expandedSections.has(section.id) && section.subsections && (
                          <div className="ml-4 space-y-1">
                            {section.subsections.map((subsection) => (
                              <Button
                                key={subsection.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start p-2 h-auto text-left text-xs text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  handleIndexClick(`${section.id}-${subsection.id}`)
                                }
                              >
                                {subsection.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="mb-8">
                  <Badge variant="secondary" className="mb-4">
                    Nola God Level Challenge 2025
                  </Badge>
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    {documentationData.title}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Solução completa para análise de dados operacionais de restaurantes.
                    Plataforma de analytics self-service que democratiza dados para donos de restaurantes.
                  </p>
                </div>

                {/* Documentation Content */}
                {markdownContent ? (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ node, children }) => {
                          const textContent = String(children).replace(/\d+\.\s*/, '');
                          const section = documentationData.sections.find(
                            (s) => s.title.includes(textContent)
                          );
                          const id = section ? section.id : '';
                          return <h2 id={id} className="text-2xl font-bold mb-4 mt-8 pt-4 border-t">{children}</h2>;
                        },
                        h3: ({ node, children }) => {
                          const textContent = String(children).replace(/\d+\.\d+\s*/, '');
                          let parentSectionId = '';

                          for (const section of documentationData.sections) {
                            const subsection = section.subsections?.find(sub => sub.title.includes(textContent));
                            if (subsection) {
                              parentSectionId = section.id;
                              break;
                            }
                          }
                          
                          const subsection = documentationData.sections
                            .flatMap(s => s.subsections?.map(sub => ({ ...sub, parentId: s.id })))
                            .find(sub => sub?.title.includes(textContent));

                          const id = subsection ? `${subsection.parentId}-${subsection.id}` : '';
                          return <h3 id={id} className="text-xl font-semibold mb-3 mt-6 pt-2">{children}</h3>;
                        },
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 italic">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                            <code className="text-sm font-mono">{children}</code>
                          </pre>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6">
                            <table className="min-w-full border-collapse border border-border">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-4 py-2">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Carregando documentação...</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}