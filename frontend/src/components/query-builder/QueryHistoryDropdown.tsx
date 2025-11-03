'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, ChevronDown } from 'lucide-react';
import { getSavedQueries, SavedQuery } from '@/lib/query-history';
import { SavedQueryItem } from './SavedQueryItem';

interface QueryHistoryDropdownProps {
  onLoadQuery: (query: SavedQuery) => void;
  onViewAll: () => void;
}

export function QueryHistoryDropdown({
  onLoadQuery,
  onViewAll,
}: QueryHistoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadQueries = () => {
    const savedQueries = getSavedQueries();
    setQueries(savedQueries);
  };

  const handleLoadQuery = (query: SavedQuery) => {
    onLoadQuery(query);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAll();
  };

  // Reload queries when dropdown opens
  const handleToggle = () => {
    if (!isOpen) {
      loadQueries();
    }
    setIsOpen(!isOpen);
  };

  const recentQueries = queries.slice(0, 8);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={handleToggle}
        className="flex items-center gap-2 transition-all duration-300 relative"
      >
        <History className="w-4 h-4" />
        Histórico
        {queries.length > 0 && (
          <Badge
            variant="secondary"
            className="ml-1 px-1.5 py-0 text-[10px] h-4 min-w-4"
          >
            {queries.length}
          </Badge>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <History className="w-4 h-4" />
                Consultas Salvas
              </h3>
            </div>

            <div className="max-h-[480px] overflow-y-auto">
              {recentQueries.length === 0 ? (
                <div className="p-8 text-center">
                  <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma consulta salva ainda
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure suas métricas e clique em "Salvar"
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {recentQueries.map((query) => (
                    <SavedQueryItem
                      key={query.id}
                      query={query}
                      onLoad={handleLoadQuery}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            {queries.length > 0 && (
              <div className="p-2 border-t border-border bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAll}
                  className="w-full justify-center text-xs"
                >
                  Ver todas as consultas ({queries.length})
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
