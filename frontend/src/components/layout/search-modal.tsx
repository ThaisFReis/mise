'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, FileText, Layers, Package, Radio, Store as StoreIcon } from 'lucide-react'
import { getSavedQueries, type SavedQuery } from '@/lib/query-history'
import type { Product, Channel, Store } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  path: string
  icon: string
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Query Builder', path: '/dashboard/query-builder', icon: 'query' },
  { name: 'Produtos', path: '/dashboard/products', icon: 'products' },
  { name: 'Canais', path: '/dashboard/channels', icon: 'channels' },
  { name: 'Lojas', path: '/dashboard/stores', icon: 'stores' },
  { name: 'Insights', path: '/dashboard/insights', icon: 'insights' },
  { name: 'FAQ', path: '/dashboard/faq', icon: 'faq' },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load saved queries from localStorage
      setSavedQueries(getSavedQueries())

      // Load data from API
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, channelsRes, storesRes] = await Promise.all([
        fetch('/api/products').then(r => r.ok ? r.json() : []),
        fetch('/api/channels').then(r => r.ok ? r.json() : []),
        fetch('/api/stores').then(r => r.ok ? r.json() : [])
      ])

      setProducts(productsRes)
      setChannels(channelsRes)
      setStores(storesRes)
    } catch (error) {
      console.error('Error loading search data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter results based on search
  const filteredNavigation = navigationItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredQueries = savedQueries.filter(query =>
    query.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProducts = products.filter(product => {
    const searchLower = search.toLowerCase()
    const nameMatch = product.name.toLowerCase().includes(searchLower)

    // Check category match safely
    const categoryStr = product.category && typeof product.category === 'object'
      ? product.category.name
      : String(product.category || '')
    const categoryMatch = categoryStr.toLowerCase().includes(searchLower)

    return nameMatch || categoryMatch
  })

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.city?.toLowerCase().includes(search.toLowerCase())
  )

  const hasResults = filteredNavigation.length > 0 ||
                     filteredQueries.length > 0 ||
                     filteredProducts.length > 0 ||
                     filteredChannels.length > 0 ||
                     filteredStores.length > 0

  // Handle navigation
  const handleNavigate = useCallback((path: string) => {
    router.push(path)
    onClose()
    setSearch('')
  }, [router, onClose])

  const handleQuerySelect = useCallback((query: SavedQuery) => {
    // Navigate to query builder with the saved query data
    const queryParams = new URLSearchParams({
      name: query.name,
      config: JSON.stringify(query.config)
    })
    handleNavigate(`/dashboard/query-builder?restore=${encodeURIComponent(query.name)}`)
  }, [handleNavigate])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        setSearch('')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="bg-background-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar páginas, consultas, produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar busca"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          )}

          {!loading && !search && (
            <p className="text-center text-muted-foreground py-8">
              Digite para pesquisar páginas, consultas salvas, produtos e mais...
            </p>
          )}

          {!loading && search && !hasResults && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum resultado encontrado para "{search}"
            </p>
          )}

          {/* Navigation Results */}
          {filteredNavigation.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Páginas ({filteredNavigation.length})
              </h3>
              <div className="space-y-1">
                {filteredNavigation.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors text-foreground"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Queries Results */}
          {filteredQueries.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Consultas Salvas ({filteredQueries.length})
              </h3>
              <div className="space-y-1">
                {filteredQueries.slice(0, 5).map((query) => (
                  <button
                    key={query.name}
                    onClick={() => handleQuerySelect(query)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                  >
                    <p className="text-foreground">{query.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(query.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {filteredProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produtos ({filteredProducts.length})
              </h3>
              <div className="space-y-1">
                {filteredProducts.slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleNavigate('/dashboard/products')}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                  >
                    <p className="text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof product.category === 'string' ? product.category : product.category?.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channels Results */}
          {filteredChannels.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Canais ({filteredChannels.length})
              </h3>
              <div className="space-y-1">
                {filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleNavigate('/dashboard/channels')}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors text-foreground"
                  >
                    {channel.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stores Results */}
          {filteredStores.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <StoreIcon className="h-4 w-4" />
                Lojas ({filteredStores.length})
              </h3>
              <div className="space-y-1">
                {filteredStores.slice(0, 5).map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleNavigate('/dashboard/stores')}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                  >
                    <p className="text-foreground">{store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.city}, {store.state}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Pressione <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Esc</kbd> para fechar
        </div>
      </div>
    </div>
  )
}
