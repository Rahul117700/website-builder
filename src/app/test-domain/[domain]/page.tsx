"use client";
import { useEffect, useState } from 'react';
import { findSubdomainForHost } from '@/lib/domainUtils';

interface TestDomainPageProps {
  params: {
    domain: string;
  };
}

export default function TestDomainPage({ params }: TestDomainPageProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testDomain() {
      try {
        setLoading(true);
        const domain = decodeURIComponent(params.domain);
        
        // Test the domain routing logic
        const subdomain = await findSubdomainForHost(domain);
        
        setResult({
          testDomain: domain,
          foundSubdomain: subdomain,
          redirectUrl: subdomain ? `/s/${subdomain}` : null,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testDomain();
  }, [params.domain]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Domain Routing Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Test Domain:</span>
              <span className="font-mono text-blue-600">{result?.testDomain}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Found Subdomain:</span>
              <span className={`font-mono ${result?.foundSubdomain ? 'text-green-600' : 'text-red-600'}`}>
                {result?.foundSubdomain || 'Not found'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Redirect URL:</span>
              <span className={`font-mono ${result?.redirectUrl ? 'text-green-600' : 'text-red-600'}`}>
                {result?.redirectUrl || 'No redirect'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Timestamp:</span>
              <span className="font-mono text-gray-600">{result?.timestamp}</span>
            </div>
          </div>
        </div>

        {result?.redirectUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Domain Routing Working!</h3>
            <p className="text-green-700 mb-3">
              The domain <strong>{result.testDomain}</strong> should redirect to:
            </p>
            <a 
              href={result.redirectUrl}
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              {result.redirectUrl}
            </a>
          </div>
        )}

        {!result?.redirectUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ No Domain Mapping Found</h3>
            <p className="text-yellow-700">
              The domain <strong>{result?.testDomain}</strong> is not configured in the system.
              Make sure it's added to the Domain table or Site customDomain field.
            </p>
          </div>
        )}

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
