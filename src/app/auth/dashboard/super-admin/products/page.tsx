'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    EyeIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserCircleIcon,
    VideoCameraIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { GlassContainer } from '@/components/super-admin/ui-kit';

export default function ProductModerationPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ search: '', isFeatured: '', isTrendingFeatured: '' });

    useEffect(() => {
        fetchProducts();
    }, [pagination.page, filters.search, filters.isFeatured, filters.isTrendingFeatured]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
            });
            if (filters.isFeatured !== '') {
                query.append('isFeatured', filters.isFeatured);
            }
            if (filters.isTrendingFeatured !== '') {
                query.append('isTrendingFeatured', filters.isTrendingFeatured);
            }
            const res = await fetch(`/api/admin/products?${query}`);
            const data = await res.json();
            setProducts(data.products || []);
            setPagination(data.pagination || pagination);
        } catch (err) {
            toast.error('Sync failure: Global product registry inaccessible');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (productId: string, currentFeatured: boolean, type: 'home' | 'trending') => {
        try {
            const bodyData = type === 'home'
                ? { productId, isFeatured: !currentFeatured }
                : { productId, isTrendingFeatured: !currentFeatured };

            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success(currentFeatured ? `Removed from ${type} feature list` : `Successfully featured on ${type}!`);
            fetchProducts();
        } catch (err) {
            toast.error('Moderation protocol failure');
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">Product Index</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Global Product & Video Moderation</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search Products..."
                                className="bg-slate-900 border border-slate-800 rounded-2xl px-12 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64 lg:w-80 font-bold placeholder:text-slate-700"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <select
                            className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 text-sm text-white font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                            value={filters.isFeatured}
                            onChange={(e) => setFilters(prev => ({ ...prev, isFeatured: e.target.value, page: 1 }))}
                        >
                            <option value="">Home: All</option>
                            <option value="true">Home: Featured</option>
                            <option value="false">Home: Not Featured</option>
                        </select>
                        <select
                            className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 text-sm text-white font-bold outline-none cursor-pointer focus:ring-2 focus:ring-red-500"
                            value={filters.isTrendingFeatured}
                            onChange={(e) => setFilters(prev => ({ ...prev, isTrendingFeatured: e.target.value, page: 1 }))}
                        >
                            <option value="">Trending: All</option>
                            <option value="true">Trending: Featured</option>
                            <option value="false">Trending: Not Featured</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <GlassContainer key={product.id} className="!p-0 border border-slate-800/60 hover:border-indigo-500/30 transition-all group">
                            <div className="relative h-40 bg-slate-900 border-b border-slate-800 overflow-hidden rounded-t-2xl">
                                {product.previewImage || product.thumbnail ? (
                                    <img src={product.previewImage || product.thumbnail} className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <ShoppingBagIcon className="w-12 h-12" />
                                    </div>
                                )}
                                {product.isFeatured && (
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-md text-yellow-500 font-bold text-[10px] rounded-lg tracking-widest uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                        <SparklesIcon className="w-3 h-3" /> Home Feat
                                    </div>
                                )}
                                {product.isTrendingFeatured && (
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500/20 border border-red-500/50 backdrop-blur-md text-red-500 font-bold text-[10px] rounded-lg tracking-widest uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                        <SparklesIcon className="w-3 h-3" /> Trend Feat
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-white italic tracking-tight line-clamp-1">{product.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <UserCircleIcon className="w-4 h-4 text-indigo-400" />
                                        <span>{product.channel?.name || 'Unknown Channel'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[10px] font-bold text-white uppercase flex items-center gap-1">
                                        Type: <span className="text-indigo-400">{product.type}</span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[10px] font-bold text-white uppercase flex items-center gap-1">
                                        Views: <span className="text-indigo-400">{product.viewCount}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50 flex-wrap">
                                    <button
                                        onClick={() => handleToggleFeatured(product.id, product.isFeatured, 'home')}
                                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${product.isFeatured
                                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-amber-950'
                                            : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                            }`}
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        {product.isFeatured ? 'Unfeat Home' : 'Feat Home'}
                                    </button>

                                    <button
                                        onClick={() => handleToggleFeatured(product.id, product.isTrendingFeatured, 'trending')}
                                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${product.isTrendingFeatured
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-red-950'
                                            : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                                            }`}
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        {product.isTrendingFeatured ? 'Unfeat Trend' : 'Feat Trend'}
                                    </button>

                                    <a
                                        href={`/channel/${product.channel?.slug}/products/${product.id}`}
                                        target="_blank"
                                        className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all rounded-xl text-slate-400 hover:text-white"
                                        title="View Product"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </GlassContainer>
                    ))}
                    {products.length === 0 && !loading && (
                        <div className="col-span-full py-40 text-center opacity-30">
                            <ShoppingBagIcon className="w-20 h-20 mx-auto mb-4" />
                            <p className="text-xl font-black tracking-[0.3em] uppercase italic text-indigo-400">Registry Clear: No Products Detected</p>
                        </div>
                    )}
                </div>

                {/* Pagination Console */}
                <div className="pt-8 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Global Sync: {pagination.total} Products / Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/20">
                            PAGE {pagination.page}
                        </div>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
