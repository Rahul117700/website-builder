'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  amount: number;
  currency: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  funnel: {
    name: string;
    product: {
      name: string;
      description: string;
      fileUrl: string;
      type: string;
    };
  };
}

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Order not found');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!order?.funnel?.product?.fileUrl) return;

    setDownloading(true);

    try {
      // Trigger download
      const link = document.createElement('a');
      link.href = order.funnel.product.fileUrl;
      link.download = order.funnel.product.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || 'The order you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-900/30 rounded-full mb-4">
            <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-gray-400">
            Thank you for your purchase. Your order is confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#333] p-8 mb-6">
          <div className="border-b border-[#333] pb-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {order.funnel.product.name}
            </h2>
            <p className="text-gray-400 mb-4">
              {order.funnel.product.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
                <div className="text-sm text-gray-400 mb-1">Order ID</div>
                <div className="font-mono text-sm text-white break-all">
                  {order.id.slice(0, 16)}...
                </div>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
                <div className="text-sm text-gray-400 mb-1">Amount Paid</div>
                <div className="text-xl font-bold text-white">
                  {order.currency} {order.amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="text-center py-8">
            <ArrowDownTrayIcon className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Your Product is Ready!
            </h3>
            <p className="text-gray-400 mb-6">
              Click the button below to download your purchase
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500"
            >
              <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
              {downloading ? 'Downloading...' : 'Download Now'}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
            <EnvelopeIcon className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">Check Your Email</h4>
            <p className="text-sm text-gray-400">
              A confirmation email has been sent to {order.customerEmail}
            </p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">Secure Download</h4>
            <p className="text-sm text-gray-400">
              Your download link is encrypted and secure
            </p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
            <DocumentTextIcon className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">Access Anytime</h4>
            <p className="text-sm text-gray-400">
              Save this link to re-download later if needed
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center border-t border-[#333] pt-6">
          <p className="text-gray-400 mb-4 font-medium">
            Need help? Have questions?
          </p>
          <a
            href={`mailto:${order.customerEmail}`}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
