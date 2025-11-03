'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Save, Table, BarChart3, LineChart, PieChart, LayoutGrid, StopCircle } from 'lucide-react';
import { MetricSelector } from '@/components/query-builder/MetricSelector';
import { DimensionSelector } from '@/components/query-builder/DimensionSelector';
import { ResultsTable } from '@/components/query-builder/ResultsTable';
import { ChartView } from '@/components/query-builder/ChartView';
import { KpiCards } from '@/components/query-builder/KpiCards';
import { ExportMenu } from '@/components/query-builder/ExportMenu';
import { QuickStartGuide } from '@/components/query-builder/QuickStartGuide';
import { ChartTypeTab } from '@/components/query-builder/ChartTypeTab';
import DateFilter, { type DateRange } from '@/components/query-builder/DateFilter';
import { QueryHistoryDropdown } from '@/components/query-builder/QueryHistoryDropdown';
import { QueryHistoryModal } from '@/components/query-builder/QueryHistoryModal';
import { useNotifications } from '@/store';
import { saveQuery, SavedQuery } from '@/lib/query-history';

type ViewMode = 'table' | 'bar' | 'line' | 'pie' | 'kpi';

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
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize with default 30-day range
  const getDefault30DayRange = (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getDefault30DayRange());
  const [config, setConfig] = useState<QueryConfig>({
    metrics: [],
    dimensions: [],
  });
  const [results, setResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showGuide, setShowGuide] = useState(true);
  const [isGuideMinimized, setIsGuideMinimized] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
      addNotification({
        type: 'warning',
        title: 'Métrica obrigatória',
        message: 'Selecione pelo menos uma métrica para executar a consulta',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Build config with date filter
      const queryConfig = {
        ...config,
        filters: [
          {
            field: 'created_at',
            operator: 'BETWEEN',
            value: [
              dateRange.startDate + 'T00:00:00.000Z',
              dateRange.endDate + 'T23:59:59.999Z',
            ],
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/query-builder/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryConfig),
        signal: abortControllerRef.current.signal,
      });

      const json = await response.json();
      console.log('[QueryBuilder Frontend] Response:', json);

      if (json.success && json.data) {
        console.log('[QueryBuilder Frontend] Setting results:', json.data);
        setResults(json.data);
        setExecutionTime(json.metadata?.executionTime || 0);

        // Show success notification
        addNotification({
          type: 'success',
          title: 'Consulta executada com sucesso',
          message: `${json.data.length} registros encontrados em ${json.metadata?.executionTime || 0}ms`,
        });

        // Scroll to results after a brief delay
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      } else {
        console.error('[QueryBuilder Frontend] Error in response:', json.error);
        setError(json.error || 'Erro ao executar query');
        addNotification({
          type: 'error',
          title: 'Erro ao executar consulta',
          message: json.error || 'Ocorreu um erro ao executar a consulta',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addNotification({
          type: 'info',
          title: 'Consulta cancelada',
          message: 'A execução da consulta foi interrompida',
        });
      } else {
        setError(err.message);
        addNotification({
          type: 'error',
          title: 'Erro ao executar consulta',
          message: err.message,
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSaveQuery = () => {
    if (config.metrics.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nada para salvar',
        message: 'Configure pelo menos uma métrica antes de salvar',
      });
      return;
    }

    const queryName = `Consulta ${new Date().toLocaleString('pt-BR')}`;
    saveQuery(queryName, config, dateRange);

    addNotification({
      type: 'success',
      title: 'Consulta salva',
      message: `"${queryName}" foi salva com sucesso`,
    });
  };

  const handleLoadQuery = (query: SavedQuery) => {
    setConfig(query.config);
    setDateRange(query.dateRange);

    addNotification({
      type: 'success',
      title: 'Consulta carregada',
      message: `"${query.name}" foi carregada com sucesso`,
    });

    // Auto-execute after loading
    setTimeout(() => {
      handleExecute();
    }, 500);
  };

  const handleMetricsChange = (selectedMetrics: string[]) => {
    setConfig(prev => ({ ...prev, metrics: selectedMetrics }));
  };

  const handleDimensionsChange = (selectedDimensions: string[]) => {
    setConfig(prev => ({ ...prev, dimensions: selectedDimensions }));
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleLoadExample = (example: 'sales-by-channel' | 'top-products' | 'store-comparison') => {
    // Minimize guide instead of closing when loading example
    setIsGuideMinimized(true);

    if (example === 'sales-by-channel') {
      setConfig({
        metrics: ['total_sales'],
        dimensions: ['channel_name'],
      });
    } else if (example === 'top-products') {
      setConfig({
        metrics: ['total_quantity', 'total_sales'],
        dimensions: ['product_name'],
      });
    } else if (example === 'store-comparison') {
      setConfig({
        metrics: ['total_sales', 'order_count'],
        dimensions: ['store_name'],
      });
    }

    // Auto-execute after loading example
    setTimeout(() => {
      handleExecute();
    }, 500);
  };

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Construtor de Consultas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crie análises personalizadas sem escrever código
          </p>
        </div>
        <div className="flex gap-2">
          {loading ? (
            <Button
              onClick={handleCancelExecution}
              variant="destructive"
              className="flex items-center gap-2 transition-all duration-300"
            >
              <StopCircle className="w-4 h-4" />
              Cancelar
            </Button>
          ) : (
            <Button
              onClick={handleExecute}
              disabled={config.metrics.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <Play className="w-4 h-4" />
              Executar
            </Button>
          )}
          <Button
            onClick={handleSaveQuery}
            disabled={config.metrics.length === 0}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-300"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
          <QueryHistoryDropdown
            onLoadQuery={handleLoadQuery}
            onViewAll={() => setShowHistoryModal(true)}
          />
        </div>
      </div>

      {/* History Modal */}
      <QueryHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onLoadQuery={handleLoadQuery}
      />

      {/* Quick Start Guide */}
      {showGuide && (
        <QuickStartGuide
          onClose={() => setShowGuide(false)}
          onLoadExample={handleLoadExample}
          isMinimized={isGuideMinimized}
          onMinimize={setIsGuideMinimized}
        />
      )}

      {/* Date Filter */}
      <DateFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
      />

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Selector */}
        <Card className="p-6 rounded-2xl bg-card shadow-gray-soft hover:scale-[1.01] transition-all duration-500">
          <h3 className="font-semibold text-foreground mb-4 flex items-center justify-between">
            <span>Métricas</span>
            <span className="text-xs text-muted-foreground font-normal">
              {config.metrics.length} selecionadas
            </span>
          </h3>
          <MetricSelector
            metrics={metadata.metrics}
            selected={config.metrics}
            onChange={handleMetricsChange}
          />
        </Card>

        {/* Dimensions Selector */}
        <Card className="p-6 rounded-2xl bg-card shadow-gray-soft hover:scale-[1.01] transition-all duration-500">
          <h3 className="font-semibold text-foreground mb-4 flex items-center justify-between">
            <span>Dimensões</span>
            <span className="text-xs text-muted-foreground font-normal">
              {config.dimensions?.length || 0} selecionadas
            </span>
          </h3>
          <DimensionSelector
            dimensions={metadata.dimensions}
            selected={config.dimensions || []}
            onChange={handleDimensionsChange}
          />
        </Card>
      </div>

      {/* Info Panel */}
      {(executionTime > 0 || results.length > 0) && (
        <div className="flex gap-6 text-xs text-muted-foreground px-1">
          <div>
            <span className="font-medium text-foreground">{executionTime}ms</span> execução
          </div>
          <div>
            <span className="font-medium text-foreground">{results.length}</span> registros
          </div>
        </div>
      )}

      {/* Results */}
      {error && (
        <Card className="p-6 rounded-2xl bg-destructive/10 border-destructive/20 shadow-gray-soft">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {results.length > 0 && (
        <Card ref={resultsRef} className="rounded-2xl bg-card shadow-gray-soft overflow-visible">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-border px-6 pt-4 sticky top-0 bg-card z-10 overflow-visible">
            <div className="flex gap-1">
              <ChartTypeTab
                icon={Table}
                label="Tabela"
                description="Visualize os dados em formato de tabela com todas as colunas e linhas detalhadas"
                isActive={viewMode === 'table'}
                onClick={() => setViewMode('table')}
              />
              <ChartTypeTab
                icon={BarChart3}
                label="Barras"
                description="Compare valores entre categorias - ideal para ver vendas por canal ou por produto"
                isActive={viewMode === 'bar'}
                onClick={() => setViewMode('bar')}
              />
              <ChartTypeTab
                icon={LineChart}
                label="Linhas"
                description="Visualize tendências ao longo do tempo - perfeito para análise temporal"
                isActive={viewMode === 'line'}
                onClick={() => setViewMode('line')}
              />
              <ChartTypeTab
                icon={PieChart}
                label="Rosca"
                description="Mostre proporções e participação percentual - ótimo para ver distribuição de vendas"
                isActive={viewMode === 'pie'}
                onClick={() => setViewMode('pie')}
              />
              <ChartTypeTab
                icon={LayoutGrid}
                label="Indicadores"
                description="Destaque métricas principais em cards visuais - ideal para resumo executivo"
                isActive={viewMode === 'kpi'}
                onClick={() => setViewMode('kpi')}
              />
            </div>
            <div className="pb-2">
              <ExportMenu
                data={results}
                filename="resultados-consulta"
                viewMode={viewMode}
                chartRef={chartRef}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-[800px] overflow-y-auto overflow-x-hidden">
            {viewMode === 'table' && (
              <ResultsTable key={executionTime} data={results} />
            )}

            {(viewMode === 'bar' || viewMode === 'line' || viewMode === 'pie') && (
              <ChartView ref={chartRef} data={results} chartType={viewMode} />
            )}

            {viewMode === 'kpi' && (
              <KpiCards ref={chartRef} data={results} />
            )}
          </div>
        </Card>
      )}

      {results.length === 0 && !loading && (
        <Card className="p-16 text-center rounded-2xl bg-card shadow-gray-soft">
          <p className="text-muted-foreground">
            Selecione métricas e clique em "Executar" para ver os resultados
          </p>
        </Card>
      )}
    </div>
  );
}
