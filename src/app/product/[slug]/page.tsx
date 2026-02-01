import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    HeartIcon,
    ShareIcon,
    ArrowDownTrayIcon,
    PlayCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Props {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;

    const product = await prisma.channelProduct.findFirst({
        where: {
            OR: [
                { slug: slug },
                { id: slug }
            ]
        },
        include: {
            channel: true
        }
    });

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: `${product.title} | ${product.channel.name}`,
        description: product.description || `Check out ${product.title} on ${product.channel.name}`,
    };
}

export default async function ProductDetailsPage({ params }: Props) {
    const { slug } = params;

    // Try finding by slug first, then ID
    const product = await prisma.channelProduct.findFirst({
        where: {
            OR: [
                { slug: slug },
                { id: slug }
            ]
        },
        include: {
            channel: true,
            reviews: {
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            }
        }
    });

    if (!product) {
        notFound();
    }

    const formatPrice = (price: any, currency: string = 'INR') => {
        const currencySymbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
        };
        const symbol = currencySymbols[currency] || currency + ' ';
        const numPrice = Number(price);
        return isNaN(numPrice) ? `${symbol}0.00` : `${symbol}${numPrice.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                    {/* Left Column: Media */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg relative group">
                            {product.previewImage || product.fileUrl ? (
                                <img
                                    src={product.previewImage ?? (product.type === 'VIDEO' ? product.previewImage ?? 'https://via.placeholder.com/800x450?text=No+Preview' : 'https://via.placeholder.com/800x450?text=No+Preview')}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                                    <PlayCircleIcon className="w-20 h-20" />
                                </div>
                            )}
                            {product.type === 'VIDEO' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors cursor-pointer">
                                    <PlayCircleIcon className="w-20 h-20 text-white opacity-90 group-hover:scale-110 transition-transform" />
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <a href={`/channel/${product.channel.slug}`} className="flex items-center gap-3 group">
                                    {product.channel.profileImage ? (
                                        <img src={product.channel.profileImage} alt={product.channel.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {product.channel.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.channel.name}</p>
                                        <p className="text-sm text-gray-500">{product.channel.totalSubscribers} subscribers</p>
                                    </div>
                                </a>

                                <div className="ml-auto flex gap-2">
                                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                        <HeartIcon className="w-6 h-6" />
                                    </button>
                                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                        <ShareIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Info & Purchase */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {product.isSubscriberOnly ? (
                                            <span className="text-indigo-600">Sub Only</span>
                                        ) : product.isFree || Number(product.price) === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : formatPrice(product.price, product.currency)}
                                    </span>
                                </div>

                                <button className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-2">
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                    {product.isSubscriberOnly ? 'Subscribe to Access' : (product.isFree || Number(product.price) === 0 ? 'Download Now' : 'Buy Now')}
                                </button>

                                <p className="text-xs text-center text-gray-500 mb-6">
                                    Secure checkout powered by Razorpay. Instant access after purchase.
                                </p>

                                <div className="space-y-3 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">File Type</span>
                                        <span className="font-medium text-gray-900 uppercase">{product.fileType || product.type || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">File Size</span>
                                        <span className="font-medium text-gray-900">{product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Views</span>
                                        <span className="font-medium text-gray-900">{product.viewCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Published</span>
                                        <span className="font-medium text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
