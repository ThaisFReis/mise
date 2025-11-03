'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File, Code, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { translateColumn } from '@/lib/translations';
import { useNotifications } from '@/store';

type ViewMode = 'table' | 'bar' | 'line' | 'pie' | 'kpi';

interface ExportMenuProps {
  data: any[];
  filename?: string;
  viewMode?: ViewMode;
  chartRef?: React.RefObject<HTMLDivElement>;
}

export function ExportMenu({ data, filename = 'query-results', viewMode = 'table', chartRef }: ExportMenuProps) {
  const { addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isChartView = viewMode !== 'table';

  if (!data || data.length === 0) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return value.toString();
    }
    return String(value);
  };

  const exportToExcel = () => {
    try {
      // Traduzir headers
      const headers = Object.keys(data[0]);
      const translatedData = data.map(row => {
        const translatedRow: any = {};
        headers.forEach(key => {
          translatedRow[translateColumn(key)] = row[key];
        });
        return translatedRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(translatedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

      // Auto-size columns
      const translatedHeaders = headers.map(translateColumn);
      const cols = translatedHeaders.map(key => ({
        wch: Math.max(
          key.length,
          ...translatedData.map(row => formatValue(row[key]).length)
        ),
      }));
      worksheet['!cols'] = cols;

      XLSX.writeFile(workbook, `${filename}.xlsx`);
      setIsOpen(false);
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Arquivo Excel baixado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar para Excel. Tente novamente.',
      });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = Object.keys(data[0]);
      const translatedHeaders = headers.map(translateColumn);

      const csv = [
        translatedHeaders.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = formatValue(row[header]);
            // Escape commas and quotes
            return value.includes(',') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        ),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      setIsOpen(false);
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Arquivo CSV baixado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar para CSV. Tente novamente.',
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text('Resultados da Consulta', 14, 15);

      // Add date
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString('pt-BR'), 14, 22);

      let startY = 30;

      // If viewing a chart, include it in the PDF
      if (isChartView && chartRef?.current) {
        try {
          // Wait for chart to render
          await new Promise(resolve => setTimeout(resolve, 500));

          const chartImage = await toPng(chartRef.current, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
            skipFonts: true, // Skip problematic font processing
            filter: (node) => {
              const className = node.className || '';
              if (typeof className === 'string') {
                return !className.includes('recharts-tooltip-wrapper');
              }
              return true;
            },
          });

          // Add chart image to PDF
          const imgWidth = 180; // Width in PDF units
          const imgHeight = 100; // Height in PDF units
          doc.addImage(chartImage, 'PNG', 15, startY, imgWidth, imgHeight);
          startY += imgHeight + 15; // Move start position for table
        } catch (chartError) {
          console.error('Error adding chart to PDF:', chartError);
          // Continue with table even if chart fails
        }
      }

      // Prepare table data
      const headers = Object.keys(data[0]);
      const translatedHeaders = headers.map(translateColumn);
      const rows = data.map(row =>
        headers.map(header => formatValue(row[header]))
      );

      // Add table
      autoTable(doc, {
        head: [translatedHeaders],
        body: rows,
        startY: startY,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [51, 65, 85], // slate-700
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`${filename}.pdf`);
      setIsOpen(false);
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Arquivo PDF baixado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar para PDF. Tente novamente.',
      });
    }
  };

  const exportToJSON = () => {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
      setIsOpen(false);
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Arquivo JSON baixado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar para JSON. Tente novamente.',
      });
    }
  };

  const exportChartAsImage = async () => {
    if (!chartRef?.current) {
      addNotification({
        type: 'warning',
        title: 'Gráfico não disponível',
        message: 'Não há nenhum gráfico disponível para exportação no momento',
      });
      return;
    }

    try {
      // Wait for chart to fully render (increased delay)
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true, // Skip problematic font processing
        filter: (node) => {
          // Filter out tooltip and problematic elements
          const className = node.className || '';
          if (typeof className === 'string') {
            return !className.includes('recharts-tooltip-wrapper');
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}-grafico.png`;
      link.click();
      setIsOpen(false);
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Gráfico exportado como imagem PNG',
      });
    } catch (error) {
      console.error('Error exporting chart as image:', error);
      addNotification({
        type: 'error',
        title: 'Erro ao exportar gráfico',
        message: error instanceof Error ? error.message : 'Erro desconhecido ao exportar o gráfico',
      });
    }
  };

  const baseOptions = [
    {
      label: 'Excel',
      icon: FileSpreadsheet,
      onClick: exportToExcel,
    },
    {
      label: 'CSV',
      icon: File,
      onClick: exportToCSV,
    },
    {
      label: 'PDF',
      icon: FileText,
      onClick: exportToPDF,
    },
    {
      label: 'JSON',
      icon: Code,
      onClick: exportToJSON,
    },
  ];

  // Add chart image export option when viewing a chart
  const exportOptions = isChartView && chartRef
    ? [
        {
          label: 'PNG (Gráfico)',
          icon: Image,
          onClick: exportChartAsImage,
        },
        ...baseOptions,
      ]
    : baseOptions;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 transition-all duration-300"
      >
        <Download className="w-4 h-4" />
        Exportar
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[50]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-lg py-2 z-[60]">
            {exportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={option.onClick}
                  className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-3 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-foreground font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
