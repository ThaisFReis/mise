'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Search,
  Trash2,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getSavedQueries,
  deleteQuery,
  renameQuery,
  exportQueries,
  SavedQuery,
} from '@/lib/query-history';
import { SavedQueryItem } from './SavedQueryItem';
import { useNotifications } from '@/store';

interface QueryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuery: (query: SavedQuery) => void;
}

export function QueryHistoryModal({
  isOpen,
  onClose,
  onLoadQuery,
}: QueryHistoryModalProps) {
  const { addNotification } = useNotifications();
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadQueries();
    }
  }, [isOpen]);

  const loadQueries = () => {
    const savedQueries = getSavedQueries();
    setQueries(savedQueries);
  };

  const filteredQueries = queries.filter((query) =>
    query.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadQuery = (query: SavedQuery) => {
    onLoadQuery(query);
    onClose();
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      const success = deleteQuery(id);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Consulta excluída',
          message: 'A consulta foi removida do histórico',
        });
        loadQueries();
        setDeleteConfirmId(null);
      } else {
        addNotification({
          type: 'error',
          title: 'Erro ao excluir',
          message: 'Não foi possível excluir a consulta',
        });
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleStartRename = (id: number) => {
    const query = queries.find((q) => q.id === id);
    if (query) {
      setEditingId(id);
      setEditingName(query.name);
    }
  };

  const handleSaveRename = () => {
    if (editingId && editingName.trim()) {
      const success = renameQuery(editingId, editingName.trim());
      if (success) {
        addNotification({
          type: 'success',
          title: 'Consulta renomeada',
          message: 'O nome da consulta foi atualizado',
        });
        loadQueries();
        setEditingId(null);
        setEditingName('');
      } else {
        addNotification({
          type: 'error',
          title: 'Erro ao renomear',
          message: 'Não foi possível renomear a consulta',
        });
      }
    }
  };

  const handleExport = () => {
    const json = exportQueries();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultas-salvas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Histórico exportado',
      message: 'O arquivo JSON foi baixado com sucesso',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <History className="w-6 h-6" />
                Histórico de Consultas
              </DialogTitle>
              <DialogDescription className="mt-2">
                Gerencie e reutilize suas consultas salvas
              </DialogDescription>
            </div>
            {queries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            )}
          </div>

          {queries.length > 0 && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="w-20 h-20 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma consulta salva
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Comece criando suas análises no Construtor de Consultas e salve-as
                para acessá-las rapidamente no futuro.
              </p>
              <Button onClick={onClose} className="mt-6">
                Criar minha primeira consulta
              </Button>
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhuma consulta encontrada para "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {editingId && (
                <div className="p-4 bg-muted/50 rounded-xl border-2 border-primary/50">
                  <p className="text-sm font-medium mb-2">Renomear consulta:</p>
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingName('');
                        }
                      }}
                      placeholder="Nome da consulta"
                      autoFocus
                    />
                    <Button onClick={handleSaveRename} size="sm">
                      Salvar
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {deleteConfirmId && (
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">
                        Tem certeza que deseja excluir esta consulta?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Esta ação não pode ser desfeita. Clique novamente em excluir
                        para confirmar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {filteredQueries.map((query) => (
                <SavedQueryItem
                  key={query.id}
                  query={query}
                  onLoad={handleLoadQuery}
                  onDelete={handleDelete}
                  onRename={handleStartRename}
                />
              ))}
            </div>
          )}
        </div>

        {queries.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                {filteredQueries.length}
              </Badge>
              {filteredQueries.length === 1 ? 'consulta' : 'consultas'} {searchTerm && 'encontrada(s)'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
