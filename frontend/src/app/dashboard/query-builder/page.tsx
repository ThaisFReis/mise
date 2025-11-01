'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Save } from 'lucide-react';
import { MetricSelector } from '@/components/query-builder/MetricSelector';
import { DimensionSelector } from '@/components/query-builder/DimensionSelector';
import { ResultsTable } from '@/components/query-builder/ResultsTable';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface QueryConfig {
  metrics: string[];
  dimensions?: string[];
  filters?: any[];
  orderBy?: any[];
  limit?: number;
}

interface Metadata {
  metrics: any[];
  dimensions: any[];
  metricCategories: string[];
}

export default function QueryBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [config, setConfig] = useState<QueryConfig>({
    metrics: [],
    dimensions: [],
  });
  const [results, setResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Load metadata on mount
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/query-builder/metadata`);
      const json = await response.json();

      if (json.success && json.data) {
        setMetadata(json.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (config.metrics.length === 0) {
      alert('Selecione pelo menos uma métrica');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/query-builder/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const json = await response.json();

      if (json.success && json.data) {
        setResults(json.data);
        setExecutionTime(json.metadata?.executionTime || 0);
      } else {
        setError(json.error || 'Erro ao executar query');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricsChange = (selectedMetrics: string[]) => {
    setConfig(prev => ({ ...prev, metrics: selectedMetrics }));
  };

  const handleDimensionsChange = (selectedDimensions: string[]) => {
    setConfig(prev => ({ ...prev, dimensions: selectedDimensions }));
  };

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Query Builder</h1>
          <p className="text-gray-500 mt-1">
            Crie análises personalizadas sem escrever código
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExecute}
            disabled={loading || config.metrics.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Executar Query
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Salvar Dashboard
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Selector */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            📊 Métricas
            <span className="text-xs text-gray-500 font-normal">
              ({config.metrics.length} selecionadas)
            </span>
          </h3>
          <MetricSelector
            metrics={metadata.metrics}
            selected={config.metrics}
            onChange={handleMetricsChange}
          />
        </Card>

        {/* Dimensions Selector */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            📏 Dimensões
            <span className="text-xs text-gray-500 font-normal">
              ({config.dimensions?.length || 0} selecionadas)
            </span>
          </h3>
          <DimensionSelector
            dimensions={metadata.dimensions}
            selected={config.dimensions || []}
            onChange={handleDimensionsChange}
          />
        </Card>

        {/* Info Panel */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">ℹ️ Informações</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Métricas disponíveis</p>
              <p className="font-semibold">{metadata.metrics.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Dimensões disponíveis</p>
              <p className="font-semibold">{metadata.dimensions.length}</p>
            </div>
            {executionTime > 0 && (
              <div>
                <p className="text-gray-500">Tempo de execução</p>
                <p className="font-semibold">{executionTime}ms</p>
              </div>
            )}
            {results.length > 0 && (
              <div>
                <p className="text-gray-500">Registros retornados</p>
                <p className="font-semibold">{results.length}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Results */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">❌ {error}</p>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">📋 Resultados</h3>
          <ResultsTable data={results} />
        </Card>
      )}

      {results.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <p className="text-gray-400 text-lg">
            👈 Selecione métricas e clique em "Executar Query" para ver os resultados
          </p>
        </Card>
      )}
    </div>
  );
}
