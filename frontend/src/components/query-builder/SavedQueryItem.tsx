'use client';

import { SavedQuery } from '@/lib/query-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Edit2, Calendar, BarChart3 } from 'lucide-react';
import { translateColumn } from '@/lib/translations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedQueryItemProps {
  query: SavedQuery;
  onLoad: (query: SavedQuery) => void;
  onDelete?: (id: number) => void;
  onRename?: (id: number) => void;
  compact?: boolean;
}

export function SavedQueryItem({
  query,
  onLoad,
  onDelete,
  onRename,
  compact = false,
}: SavedQueryItemProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  const formatDateRange = () => {
    try {
      const start = format(new Date(query.dateRange.startDate), 'dd/MM/yy');
      const end = format(new Date(query.dateRange.endDate), 'dd/MM/yy');
      return `${start} - ${end}`;
    } catch {
      return '';
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => onLoad(query)}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {query.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDateRange()}</span>
            </div>
          </div>
          <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {query.config.metrics.slice(0, 3).map((metric) => (
            <Badge
              key={metric}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {translateColumn(metric)}
            </Badge>
          ))}
          {query.config.metrics.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{query.config.metrics.length - 3}
            </Badge>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{query.name}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Criada em {formatDate(query.createdAt)}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateRange()}</span>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Métricas ({query.config.metrics.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {query.config.metrics.map((metric) => (
                  <Badge key={metric} variant="secondary" className="text-xs">
                    {translateColumn(metric)}
                  </Badge>
                ))}
              </div>
            </div>

            {query.config.dimensions && query.config.dimensions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Dimensões ({query.config.dimensions.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {query.config.dimensions.map((dimension) => (
                    <Badge key={dimension} variant="outline" className="text-xs">
                      {translateColumn(dimension)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onLoad(query)}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Carregar
          </Button>
          {onRename && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRename(query.id)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(query.id)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
