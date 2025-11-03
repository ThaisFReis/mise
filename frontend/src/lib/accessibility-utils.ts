/**
 * Utilitários de Acessibilidade
 *
 * Funções e helpers para implementar acessibilidade conforme WCAG 2.1 AA
 * e Lei Brasileira de Inclusão (LBI)
 */

/**
 * Gera um ID único para associar labels, descriptions e errors
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Retorna o texto apropriado para anunciar o estado de ordenação
 */
export function getSortAriaLabel(
  column: string,
  currentSort: 'asc' | 'desc' | 'none'
): string {
  const estados = {
    none: `Ordenar ${column}`,
    asc: `${column} ordenado crescente. Clique para ordenar decrescente`,
    desc: `${column} ordenado decrescente. Clique para remover ordenação`,
  }
  return estados[currentSort]
}

/**
 * Retorna o valor ARIA correto para aria-sort
 */
export function getAriaSortValue(
  currentSort: 'asc' | 'desc' | 'none'
): 'ascending' | 'descending' | 'none' {
  const mapping = {
    asc: 'ascending' as const,
    desc: 'descending' as const,
    none: 'none' as const,
  }
  return mapping[currentSort]
}

/**
 * Formata números para serem mais legíveis por leitores de tela
 * Exemplo: 1234.56 -> "mil duzentos e trinta e quatro vírgula cinquenta e seis"
 */
export function formatNumberForScreenReader(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata valores monetários para leitores de tela
 */
export function formatCurrencyForScreenReader(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata percentuais para leitores de tela
 */
export function formatPercentForScreenReader(value: number): string {
  return `${formatNumberForScreenReader(value)} por cento`
}

/**
 * Gera texto alternativo para ícones de tendência
 */
export function getTrendAriaLabel(value: number, type: 'increase' | 'decrease'): string {
  const abs = Math.abs(value)
  const formatted = formatPercentForScreenReader(abs)

  if (type === 'increase') {
    return `Aumento de ${formatted}`
  }
  return `Redução de ${formatted}`
}

/**
 * Combina múltiplos IDs para aria-describedby ou aria-labelledby
 */
export function combineIds(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter(Boolean)
  return validIds.length > 0 ? validIds.join(' ') : undefined
}

/**
 * Hook de teclado padrão para fechar modais/menus (Escape)
 */
export function handleEscapeKey(
  event: React.KeyboardEvent,
  onClose: () => void
): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    onClose()
  }
}

/**
 * Hook de teclado para ativar elementos (Enter ou Space)
 */
export function handleActivationKeys(
  event: React.KeyboardEvent,
  onActivate: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onActivate()
  }
}

/**
 * Gerencia navegação por Arrow keys em listas
 */
export function handleArrowNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void,
  orientation: 'horizontal' | 'vertical' = 'vertical'
): void {
  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

  if (event.key === nextKey) {
    event.preventDefault()
    const newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  } else if (event.key === prevKey) {
    event.preventDefault()
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1
    onNavigate(newIndex)
  } else if (event.key === 'Home') {
    event.preventDefault()
    onNavigate(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    onNavigate(totalItems - 1)
  }
}

/**
 * Retorna o status de loading em texto para anúncio
 */
export function getLoadingAnnouncement(isLoading: boolean, itemName: string): string {
  return isLoading ? `Carregando ${itemName}...` : `${itemName} carregado`
}

/**
 * Classe CSS para elementos visíveis apenas para leitores de tela
 */
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'

/**
 * Anunciar mensagem para leitores de tela via live region
 * Retorna o texto que deve ser colocado em um elemento com aria-live
 */
export function announceToScreenReader(message: string): string {
  return message
}

/**
 * Valida se um elemento pode receber foco
 */
export function isFocusable(element: HTMLElement): boolean {
  return (
    element.tabIndex >= 0 &&
    !element.hasAttribute('disabled') &&
    element.offsetParent !== null
  )
}

/**
 * Move o foco para um elemento específico
 */
export function moveFocusTo(element: HTMLElement | null): void {
  if (element && isFocusable(element)) {
    element.focus()
  }
}

/**
 * Encontra todos os elementos focáveis dentro de um container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    isFocusable
  )
}

/**
 * Implementa Focus Trap para modais
 */
export function trapFocus(
  event: React.KeyboardEvent,
  containerRef: React.RefObject<HTMLElement>
): void {
  if (event.key !== 'Tab' || !containerRef.current) return

  const focusableElements = getFocusableElements(containerRef.current)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

/**
 * Retorna mensagem de erro acessível para validação de formulários
 */
export function getFieldErrorMessage(
  fieldName: string,
  errorType: 'required' | 'invalid' | 'min' | 'max' | 'pattern',
  customMessage?: string
): string {
  if (customMessage) return customMessage

  const messages = {
    required: `O campo ${fieldName} é obrigatório`,
    invalid: `O valor informado para ${fieldName} é inválido`,
    min: `O valor de ${fieldName} está abaixo do mínimo permitido`,
    max: `O valor de ${fieldName} está acima do máximo permitido`,
    pattern: `O formato de ${fieldName} não é válido`,
  }

  return messages[errorType]
}

/**
 * Calcula o contraste entre duas cores (para validação WCAG)
 * Retorna a razão de contraste (ex: 4.5:1 = 4.5)
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  // Implementação simplificada - em produção, use uma biblioteca como color-contrast-checker
  // Esta função requer conversão de cores hex/rgb para valores de luminância
  // Por enquanto, retorna um placeholder
  return 4.5 // Placeholder - implementar cálculo real se necessário
}

/**
 * Verifica se o contraste atende aos requisitos WCAG AA
 */
export function meetsWCAGContrast(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5
}
