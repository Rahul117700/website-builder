'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  UserCircleIcon, 
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  EyeIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function SuperAdminUserView() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    
    fetch(`/api/admin/users/${userId}`)
      .then(async r => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch user');
        }
        return r.json();
      })
      .then(data => {
        console.log('[User Detail Page] Full API response:', data);
        console.log('[User Detail Page] User data:', {
          userId: data.user?.id,
          email: data.user?.email,
          channelsCount: data.user?.channels?.length || 0,
          _countChannels: data.user?._count?.channels || 0,
          hasChannelsArray: Array.isArray(data.user?.channels),
          channels: data.user?.channels?.map((c: any) => ({ 
            id: c.id, 
            name: c.name, 
            slug: c.slug,
            productsCount: c.products?.length || 0,
            _countProducts: c._count?.products || 0
          })) || []
        });
        
        if (data.user) {
          setUser(data.user);
        } else {
          throw new Error('User data not found in response');
        }
      })
      .catch((err) => {
        console.error('[User Detail Page] Error loading user:', err);
        setError(err.message || 'Failed to load user data');
        toast.error(err.message || 'Failed to load user data');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500 bg-white min-h-screen w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4">Loading user details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-red-500 bg-white min-h-screen w-full">
          <XCircleIcon className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/auth/dashboard/super-admin')}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const activePlan = user.subscriptions?.find((sub: any) => 
    new Date(sub.endDate) > new Date() && sub.status === 'ACTIVE'
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/auth/dashboard/super-admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-2xl">
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name || 'No name'}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.status === 'DISABLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Joined</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Channels</p>
                <p className="text-3xl font-bold text-blue-600">{user._count?.channels || 0}</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-green-600">
                  {user.channels?.reduce((sum: number, ch: any) => sum + (ch._count?.products || 0), 0) || 0}
                </p>
              </div>
              <ShoppingCartIcon className="h-12 w-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                <p className="text-xl font-bold text-purple-600">
                  {activePlan ? activePlan.plan.name : 'Free Tier'}
                </p>
                {activePlan && (
                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(activePlan.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <CreditCardIcon className="h-12 w-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {user.subscriptions && user.subscriptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2 text-purple-600" />
              Subscription History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {user.subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.plan.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.plan.currency} {sub.plan.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          new Date(sub.endDate) > new Date() && sub.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(sub.endDate) > new Date() && sub.status === 'ACTIVE' ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Channels Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Channels ({user.channels?.length || 0})
          </h2>
          
          {user.channels && user.channels.length > 0 ? (
            <div className="space-y-4">
              {user.channels.map((channel: any) => {
                const channelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sellearndirect.com'}/channel/${channel.slug}`;
                const totalViews = channel.products?.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0) || 0;
                
                return (
                  <div 
                    key={channel.id} 
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            channel.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : channel.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {channel.status}
                          </span>
                          {channel.published && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Published
                            </span>
                          )}
                        </div>
                        
                        {channel.description && (
                          <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Created: {new Date(channel.createdAt).toLocaleDateString()}
                          </div>
                          {channel.template && (
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              Template: {channel.template.name}
                            </div>
                          )}
                          <div className="flex items-center">
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            Products: {channel._count?.products || 0}
                          </div>
                          <div className="flex items-center">
                            <UserCircleIcon className="h-4 w-4 mr-1" />
                            Subscribers: {channel._count?.subscribers || 0}
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Total Views: {totalViews}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Channel Link */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Channel Link:
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <code className="text-sm text-blue-600 break-all">
                            {channelUrl}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(channelUrl)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Copy
                        </button>
                        {channel.published && channel.status === 'ACTIVE' && (
                          <a
                            href={channelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Channel Products */}
                    {channel.products && channel.products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Products in this channel:</p>
                        <div className="space-y-2">
                          {channel.products.map((product: any) => (
                            <div key={product.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{product.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span>Views: {product.viewCount || 0}</span>
                                  {product.price && (
                                    <span>Price: ₹{typeof product.price === 'object' && 'toNumber' in product.price ? product.price.toNumber() : product.price}</span>
                                  )}
                                  {product.type && (
                                    <span className="capitalize">Type: {product.type}</span>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                product.published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No channels created yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

