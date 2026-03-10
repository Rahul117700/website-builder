'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';

interface ProductData { id: string; title: string; channelName: string; views: number; conversions: number; revenue: number; conversionRate: number; likes: number; reviews: number; }
interface PagePerformanceProps { topProducts?: ProductData[]; }

export default function PagePerformance({ topProducts = [] }: PagePerformanceProps) {
  const pages = topProducts.slice(0, 10).map((product) => {
    const uniqueViews = Math.round(product.views * 0.75);
    const bounceRate = product.conversionRate > 0 ? Math.round(100 - (product.conversions / product.views) * 100) : 50;
    return { path: product.title, channelName: product.channelName, pageViews: product.views, uniqueViews, avgTimeOnPage: '3m 0s', bounceRate, conversions: product.conversions, revenue: product.revenue };
  });

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Product Performance</h3>
          <p className="text-[10px] text-gray-500">Channel product engagement metrics</p>
        </div>
      </div>

      {pages.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 font-semibold text-gray-500">Product</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-500">Views</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-500">Unique</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-white text-xs truncate max-w-[200px]">{page.path}</span>
                        <span className="text-[9px] text-gray-600">{page.channelName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-300">{page.pageViews.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-500">{page.uniqueViews.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-[10px] text-gray-600 mb-0.5">Total Views</p>
              <p className="text-sm font-bold text-white">{pages.reduce((sum, p) => sum + p.pageViews, 0).toLocaleString()}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <ChartBarIcon className="h-8 w-8 text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-600">No product performance data available</p>
        </div>
      )}
    </div>
  );
}
