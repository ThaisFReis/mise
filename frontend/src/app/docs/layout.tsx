import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentação Técnica - Mise | Restaurant Analytics Platform',
  description: 'Documentação técnica completa da plataforma Mise. Explore arquitetura, APIs, guia de instalação e decisões técnicas para analytics de restaurantes.',
  keywords: ['documentação', 'API', 'analytics', 'restaurantes', 'Mise', 'tecnologia', 'desenvolvimento'],
  openGraph: {
    title: 'Documentação Técnica - Mise',
    description: 'Documentação técnica completa da plataforma de analytics para restaurantes',
    type: 'website',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}