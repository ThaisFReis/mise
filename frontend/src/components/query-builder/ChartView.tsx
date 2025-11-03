'use client';

import { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { translateColumn } from '@/lib/translations';

type ChartType = 'bar' | 'line' | 'pie';

interface ChartViewProps {
  data: any[];
  chartType: ChartType;
}

export const ChartView = forwardRef<HTMLDivElement, ChartViewProps>(
  ({ data, chartType }, ref) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado para visualizar
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const dimensionColumn = columns.find(col =>
    !col.toLowerCase().includes('total') &&
    !col.toLowerCase().includes('count') &&
    !col.toLowerCase().includes('avg') &&
    !col.toLowerCase().includes('sum')
  ) || columns[0];

  const metricColumns = columns.filter(col => col !== dimensionColumn);

  // Format numbers for display
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Check if column is currency-related
  const isCurrencyColumn = (columnName: string): boolean => {
    return columnName.toLowerCase().includes('sales') ||
           columnName.toLowerCase().includes('revenue') ||
           columnName.toLowerCase().includes('amount') ||
           columnName.toLowerCase().includes('total');
  };

  // Build chart config
  const chartConfig: ChartConfig = metricColumns.reduce((config, metric, index) => {
    config[metric] = {
      label: translateColumn(metric),
      color: `var(--chart-${(index % 10) + 1})`,
    };
    return config;
  }, {} as ChartConfig);

  // Convert string numbers to numbers
  const chartData = data.map(row => {
    const newRow: any = { [dimensionColumn]: row[dimensionColumn] };
    metricColumns.forEach(col => {
      const value = row[col];
      newRow[col] = typeof value === 'string' ? Number(value) : value;
    });
    return newRow;
  });

  // Custom tooltip formatter
  const tooltipFormatter = (value: any, name: any) => {
    const numValue = typeof value === 'string' ? Number(value) : value;
    const formattedValue = isCurrencyColumn(String(name)) ? formatCurrency(numValue) : numValue.toLocaleString('pt-BR');
    return [formattedValue, translateColumn(String(name))];
  };

  if (chartType === 'bar') {
    return (
      <div ref={ref}>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
          <defs>
            {metricColumns.map((metric, index) => (
              <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--chart-${(index % 10) + 1})`} stopOpacity={0.9} />
                <stop offset="100%" stopColor={`var(--chart-${(index % 10) + 1})`} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey={dimensionColumn}
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={tooltipFormatter}
                labelFormatter={(label) => String(label)}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {metricColumns.map((metric) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={`url(#gradient-${metric})`}
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </BarChart>
      </ChartContainer>
      </div>
    );
  }

  if (chartType === 'line') {
    return (
      <div ref={ref}>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
          <defs>
            {metricColumns.map((metric, index) => (
              <linearGradient key={metric} id={`line-gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--chart-${(index % 10) + 1})`} stopOpacity={0.3} />
                <stop offset="100%" stopColor={`var(--chart-${(index % 10) + 1})`} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey={dimensionColumn}
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <ChartTooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={tooltipFormatter}
                labelFormatter={(label) => String(label)}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {metricColumns.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={`var(--chart-${(index % 10) + 1})`}
              strokeWidth={3}
              fill={`url(#line-gradient-${metric})`}
              dot={{
                r: 5,
                strokeWidth: 2,
                fill: 'var(--background)',
                stroke: `var(--chart-${(index % 10) + 1})`,
              }}
              activeDot={{
                r: 8,
                strokeWidth: 3,
                fill: `var(--chart-${(index % 10) + 1})`,
                stroke: 'var(--background)',
              }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </LineChart>
      </ChartContainer>
      </div>
    );
  }

  if (chartType === 'pie') {
    // For pie chart, use only the first metric
    const metric = metricColumns[0];
    const pieData = chartData.map((row, index) => ({
      name: row[dimensionColumn],
      value: row[metric],
      fill: `var(--chart-${(index % 10) + 1})`,
    }));

    // Create pie chart config
    const pieChartConfig: ChartConfig = pieData.reduce((config, item, index) => {
      config[item.name] = {
        label: item.name,
        color: `var(--chart-${(index % 10) + 1})`,
      };
      return config;
    }, {} as ChartConfig);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div ref={ref}>
        <ChartContainer config={pieChartConfig} className="min-h-[400px] w-full">
          <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [formatCurrency(Number(value)), translateColumn(metric)]}
                hideLabel
              />
            }
          />
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
      </div>
    );
  }

  return null;
});

ChartView.displayName = 'ChartView';
