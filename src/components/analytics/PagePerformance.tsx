'use client';

import { EyeIcon, ClockIcon, ArrowRightOnRectangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface ProductData {
  id: string;
  title: string;
  channelName: string;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  likes: number;
  reviews: number;
}

interface PagePerformanceProps {
  topProducts?: ProductData[];
}

export default function PagePerformance({ topProducts = [] }: PagePerformanceProps) {
  // Convert product data to page-like format for display
  const pages = topProducts.slice(0, 10).map((product) => {
    // Estimate metrics based on product data
    const uniqueViews = Math.round(product.views * 0.75); // Estimate 75% unique
    const avgTimeOnPage = '3m 0s'; // Estimated
    const bounceRate = product.conversionRate > 0 
      ? Math.round(100 - (product.conversions / product.views) * 100) 
      : 50;
    const exitRate = Math.round(bounceRate * 0.8);
    
    return {
      path: product.title,
      channelName: product.channelName,
      pageViews: product.views,
      uniqueViews,
      avgTimeOnPage,
      entrances: product.views,
      bounceRate,
      exitRate,
      conversions: product.conversions,
      revenue: product.revenue,
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Product Performance</h3>
          <p className="text-[10px] text-gray-600">Channel product engagement metrics</p>
        </div>
      </div>

      {/* Table */}
      {pages.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Product</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Views</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Unique</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-xs truncate max-w-[200px]">{page.path}</span>
                        <span className="text-[9px] text-gray-500">{page.channelName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-900">
                      {page.pageViews.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {page.uniqueViews.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div>
              <p className="text-[10px] text-gray-600 mb-0.5">Total Views</p>
              <p className="text-sm font-bold text-gray-900">
                {pages.reduce((sum, p) => sum + p.pageViews, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600">No product performance data available</p>
        </div>
      )}
    </div>
  );
}

