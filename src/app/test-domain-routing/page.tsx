"use client";
import { useEffect, useState } from 'react';
import { findSubdomainForHost } from '@/lib/domainUtils';

export default function TestDomainRoutingPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testDomains() {
      try {
        setLoading(true);
        
        const testHosts = [
          'nextskillpro.com',
          'www.nextskillpro.com',
          'agoda.com',
          'www.agoda.com',
          'localhost:3000',
          '31.97.233.221:3000'
        ];
        
        const results = [];
        
        for (const host of testHosts) {
          const subdomain = await findSubdomainForHost(host);
          results.push({
            host,
            subdomain,
            redirectUrl: subdomain ? `/s/${subdomain}` : null,
            shouldRedirect: !!subdomain
          });
        }
        
        setResults(results);
      } catch (error) {
        console.error('Error testing domains:', error);
      } finally {
        setLoading(false);
      }
    }

    testDomains();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing domain routing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Domain Routing Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subdomain Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redirect URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results?.map((result: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.host}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.subdomain || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.redirectUrl || 'No redirect'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.shouldRedirect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.shouldRedirect ? '✅ Will Redirect' : '❌ No Redirect'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>nextskillpro.com</strong> → Should redirect to <code>/s/nextskillpro</code></li>
            <li>• <strong>www.nextskillpro.com</strong> → Should redirect to <code>/s/nextskillpro</code></li>
            <li>• <strong>agoda.com</strong> → Should NOT redirect (no domain connected)</li>
            <li>• <strong>localhost:3000</strong> → Should NOT redirect (development)</li>
            <li>• <strong>31.97.233.221:3000</strong> → Should NOT redirect (server IP)</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
