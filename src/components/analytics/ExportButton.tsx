'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  data: any;
  filename?: string;
}

export default function ExportButton({ data, filename = 'analytics-export' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToCSV = () => {
    if (!data || !data.overview) return;

    const csvRows = [];
    
    // Header
    csvRows.push(['Metric', 'Value'].join(','));
    
    // Overview data
    csvRows.push(['Total Visitors', data.overview.totalVisitors].join(','));
    csvRows.push(['Total Conversions', data.overview.totalConversions].join(','));
    csvRows.push(['Total Revenue', `₹${data.overview.totalRevenue}`].join(','));
    csvRows.push(['Conversion Rate', `${data.overview.avgConversionRate}%`].join(','));
    
    // Top funnels
    if (data.chartData?.topFunnels?.length > 0) {
      csvRows.push(['', ''].join(','));
      csvRows.push(['Top Funnels', ''].join(','));
      csvRows.push(['Name', 'Revenue', 'Visitors', 'Conversion Rate'].join(','));
      
      data.chartData.topFunnels.forEach((funnel: any) => {
        csvRows.push([
          funnel.name,
          `₹${funnel.revenue}`,
          funnel.visitors,
          `${funnel.conversionRate}%`
        ].join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToPDF = () => {
    // Create a simple HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1f2937; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .metric { display: inline-block; padding: 20px; margin: 10px; background: #f9fafb; border-radius: 8px; min-width: 200px; }
          .metric-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .metric-value { font-size: 32px; font-weight: bold; color: #1f2937; margin-top: 5px; }
        </style>
      </head>
      <body>
        <h1>Analytics Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Overview</h2>
        <div>
          <div class="metric">
            <div class="metric-label">Total Visitors</div>
            <div class="metric-value">${data.overview?.totalVisitors || 0}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Conversions</div>
            <div class="metric-value">${data.overview?.totalConversions || 0}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">₹${data.overview?.totalRevenue || 0}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Conversion Rate</div>
            <div class="metric-value">${data.overview?.avgConversionRate || 0}%</div>
          </div>
        </div>
        
        ${data.chartData?.topFunnels?.length > 0 ? `
          <h2>Top Performing Funnels</h2>
          <table>
            <thead>
              <tr>
                <th>Funnel Name</th>
                <th>Revenue</th>
                <th>Visitors</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              ${data.chartData.topFunnels.map((funnel: any) => `
                <tr>
                  <td>${funnel.name}</td>
                  <td>₹${funnel.revenue}</td>
                  <td>${funnel.visitors}</td>
                  <td>${funnel.conversionRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs bg-white"
      >
        <ArrowDownTrayIcon className="h-4 w-4 text-gray-600" />
        <span className="text-gray-900 font-medium">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={exportToCSV}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <TableCellsIcon className="h-4 w-4 text-gray-600" />
            <span>Export as CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 text-gray-600" />
            <span>Export as HTML Report</span>
          </button>
        </div>
      )}
    </div>
  );
}

