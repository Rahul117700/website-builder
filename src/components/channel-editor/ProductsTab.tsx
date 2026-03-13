'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PlusIcon, ShoppingBagIcon, XMarkIcon, CloudArrowUpIcon, PencilIcon, TrashIcon, CheckCircleIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChannelProductType } from '@prisma/client';

// Helper for Portal
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

interface ProductsTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
  subscriptionData?: any;
  onShowPlans?: () => void;
}

export default function ProductsTab({ channel, onUpdate, subscriptionData, onShowPlans }: ProductsTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');


  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`/api/channels/${channel.id}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [channel.id]);

  const handleProductUpload = async (formData: FormData) => {
    setUploading(true);
    setUploadProgress(10); // Start progress

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) {
            return Math.min(prev + 5, 90);
          }
          return prev;
        });
      }, 300);

      const response = await fetch(`/api/channels/${channel.id}/products/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload product');
      }

      setUploadProgress(100);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh products
      const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setShowUploadModal(false);
      setUploadProgress(0);
      setShowUploadModal(false);
      setUploadProgress(0);
      setSuccessMessage('Product uploaded successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error uploading product:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload product';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenUploadModal = () => {
    // Check product limits - Use account-wide usage if available
    const productCount = subscriptionData?.usage?.products ?? products.length;

    // Default to free tier limits if no subscription data
    const isPremium = subscriptionData?.hasActivePlan;
    const maxProducts = isPremium ? (subscriptionData?.usage?.maxProducts ?? -1) : 1;

    if (maxProducts !== -1 && productCount >= maxProducts) {
      setErrorMessage(`You've reached the ${isPremium ? 'maximum' : 'free'} limit of ${maxProducts} product${maxProducts === 1 ? '' : 's'} across your account. Upgrade your plan to add more products!`);
      setShowErrorModal(true);
      return;
    }

    setShowUploadModal(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteConfirmationModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(productToDelete);
    setShowDeleteConfirmationModal(false); // Close confirmation immediately or keep open with loading state? Let's close and show loading on button if we kept it, but here we used native so let's close.
    // Actually, common pattern is to keep it open with loading, OR close and show global loading.
    // Let's close it and show deleting spinner in the list as before.

    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${productToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete product');
      }

      const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setSuccessMessage('Product deleted successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete product';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setDeleting(null);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Adaptive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(() => {
          const isPremium = subscriptionData?.hasActivePlan;
          const maxProducts = isPremium ? (subscriptionData?.activeSubscription?.plan?.maxProducts ?? -1) : 1;
          const productCount = products.length;
          const remaining = maxProducts === -1 ? '∞' : Math.max(0, maxProducts - productCount);

          return (
            <>
              {/* Products Added */}
              <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between min-h-[100px] group hover:border-indigo-500/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <ShoppingBagIcon className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Products</span>
                </div>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-2xl font-black text-white leading-none">{productCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 mb-0.5 whitespace-nowrap">items added</span>
                </div>
              </div>

              {/* Storage Limit */}
              <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between min-h-[100px] group hover:border-blue-500/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CloudArrowUpIcon className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Limit</span>
                </div>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-2xl font-black text-white leading-none">{maxProducts === -1 ? '∞' : maxProducts}</span>
                  <span className="text-[10px] font-bold text-gray-400 mb-0.5 whitespace-nowrap">max slots</span>
                </div>
              </div>

              {/* Available Slots */}
              <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[100px] transition-all hover:shadow-md ${remaining === 0 ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${remaining === 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <PlusIcon className={`w-3 h-3 ${remaining === 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${remaining === 0 ? 'text-red-400' : 'text-emerald-500'}`}>Available</span>
                </div>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className={`text-2xl font-black leading-none ${remaining === 0 ? 'text-red-600' : 'text-emerald-600'}`}>{remaining}</span>
                  <span className={`text-[10px] font-bold mb-0.5 whitespace-nowrap ${remaining === 0 ? 'text-red-400' : 'text-emerald-500'}`}>slots free</span>
                </div>
              </div>

              {/* Add New Button */}
              <button
                onClick={handleOpenUploadModal}
                className="group relative min-h-[100px] bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-4 text-left border border-gray-800"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                    <PlusIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[7px] font-black text-white/40 uppercase tracking-widest">
                    New
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <span className="block text-sm font-black text-white leading-tight">Add Content</span>
                  <span className="block text-[8px] font-medium text-white/50 uppercase tracking-wider mt-0.5 truncate">Grow your store</span>
                </div>
              </button>
            </>
          );
        })()}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#1e1e1e] p-3 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search your products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/10 focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm transition-all text-white placeholder-gray-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
          {['ALL', 'VIDEO', 'EBOOK', 'DOCUMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {(() => {
        const filteredProducts = products.filter(product => {
          const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType = filterType === 'ALL' || product.type === filterType;
          return matchesSearch && matchesType;
        });

        if (products.length > 0 && filteredProducts.length === 0) {
          return (
            <div className="text-center py-20 bg-[#1e1e1e]/50 rounded-3xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-white">No matching products</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filter</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
                className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          );
        }

        return products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (

              <div
                key={product.id}
                className="group relative bg-[#1e1e1e] rounded-3xl border border-white/10 overflow-hidden hover:shadow-xl hover:border-indigo-500/30 transition-all duration-500 flex flex-col"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-50/50">
                  {product.previewImage || product.thumbnailUrl ? (
                    <img
                      src={product.previewImage || product.thumbnailUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        // Show placeholder icon container
                        const parent = target.parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector('.placeholder-icon');
                          if (placeholder) placeholder.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}

                  {/* Placeholder Icon (Hidden if image loads) */}
                  <div className={`placeholder-icon absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50/30 ${product.previewImage || product.thumbnailUrl ? 'hidden' : ''}`}>
                    <ShoppingBagIcon className="w-10 h-10 text-indigo-100" />
                  </div>

                  {/* Overlays & Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest border border-white shadow-sm">
                      {product.type === 'VIDEOS' ? '🎥 Video' : '📄 Doc'}
                    </span>
                    {product.isSubscriberOnly && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-emerald-400/30 shadow-sm">
                        ✨ Premium
                      </span>
                    )}
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/30 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="w-10 h-10 rounded-xl bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting === product.id ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-black text-white text-lg leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {product.title}
                      </h4>
                    </div>
                    {product.description ? (
                      <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium mb-4">
                        {product.description}
                      </p>
                    ) : (
                      <div className="h-4 w-2/3 bg-gray-50 rounded-full mb-4 opacity-50" />
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex -space-x-1 overflow-hidden">
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {product.tags.slice(0, 2).map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          Uncategorized
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Reference</span>
                      <span className="text-[11px] font-bold text-gray-400 font-mono">
                        #{product.id.substring(0, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Add Products</h3>
            <p className="text-sm text-gray-400 mb-6">
              Products will be displayed in a beautiful grid on your channel
            </p>
            <button
              onClick={handleOpenUploadModal}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Product
            </button>
          </div>
        );
      })()}


      {/* Upload Modal */}
      {showUploadModal && (
        <ProductUploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadProgress(0);
          }}
          onUpload={handleProductUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          channel={channel}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <ProductEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          channel={channel}
          onUpdate={async () => {
            const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
            if (productsResponse.ok) {
              const updatedProducts = await productsResponse.json();
              setProducts(updatedProducts);
            }
            setShowEditModal(false);
            setEditingProduct(null);
            setShowEditModal(false);
            setEditingProduct(null);
            setSuccessMessage('Product updated successfully!');
            setShowSuccessModal(true);
          }}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage || "Product uploaded successfully!"}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
          onUpgrade={() => {
            setShowErrorModal(false);
            onShowPlans?.();
          }}
          isLimitError={errorMessage.includes('limit')}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmationModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmationModal}
          onClose={() => {
            setShowDeleteConfirmationModal(false);
            setProductToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

// Product Upload Modal Component
function ProductUploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading,
  uploadProgress,
  channel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  uploading: boolean;
  uploadProgress: number;
  channel: any;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DOCUMENTS' as ChannelProductType,
    isSubscriberOnly: false,
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'DOCUMENTS' as ChannelProductType,
        isSubscriberOnly: false,
        tags: '',
      });
      setFile(null);
      setPreview(null);
      setCoverImage(null);
      setCoverPreview(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a product title');
      setShowErrorModal(true);
      return;
    }

    if (!coverImage) {
      setErrorMessage('Please upload a cover image');
      setShowErrorModal(true);
      return;
    }

    if (!file && !formData.description.trim()) {
      setErrorMessage('Please either upload a file or provide a description');
      setShowErrorModal(true);
      return;
    }

    if (file && file.size > 500 * 1024 * 1024) {
      setErrorMessage('File size exceeds 500MB limit');
      setShowErrorModal(true);
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('title', formData.title.trim());
    uploadFormData.append('description', formData.description.trim());
    uploadFormData.append('type', formData.type);
    uploadFormData.append('price', '0');
    uploadFormData.append('currency', 'INR');
    uploadFormData.append('tags', formData.tags); // Selected tag
    uploadFormData.append('isFree', 'true');
    uploadFormData.append('isSubscriberOnly', formData.isSubscriberOnly.toString());

    if (file) {
      uploadFormData.append('file', file);
    }

    if (coverImage) {
      uploadFormData.append('coverImage', coverImage);
    }

    onUpload(uploadFormData);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB for images
      if (selectedFile.size > maxSize) {
        setErrorMessage(`Cover image size exceeds 5MB limit`);
        setShowErrorModal(true);
        e.target.value = '';
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setErrorMessage(`Please upload a valid image file (JPG, PNG, WEBP)`);
        setShowErrorModal(true);
        e.target.value = '';
        return;
      }

      setCoverImage(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (selectedFile.size > maxSize) {
        setErrorMessage(`File size (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB) exceeds 500MB limit`);
        setShowErrorModal(true);
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl bg-[#141414] border border-white/10 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-[#141414]/90 backdrop-blur-md z-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Add New Product</h2>
              <p className="text-sm text-gray-500 mt-1">Share your content with the world</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Left Column: Details */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Product Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-600 bg-white/5 transition-all font-medium"
                    placeholder="e.g., Ultimate Web Development Course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-600 bg-white/5 transition-all resize-none"
                    placeholder="Tell your audience what makes this product special..."
                  />
                  <p className="text-right text-xs text-gray-400 mt-2">{formData.description.length} characters</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Product Type <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ChannelProductType })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white bg-white/5 appearance-none font-medium cursor-pointer"
                      >
                        <option value="VIDEOS">Video Content</option>
                        <option value="DOCUMENTS">Document / PDF</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Product Tag</label>
                    <div className="relative">
                      <select
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white bg-white/5 appearance-none font-medium cursor-pointer"
                      >
                        <option value="">No Tag</option>
                        <option value="MUSIC">🎵 Music</option>
                        <option value="SPORTS">🏆 Sports</option>
                        <option value="GAMING">🎮 Gaming</option>
                        <option value="NEWS">📰 News</option>
                        <option value="LEARNING">💡 Learning</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-300">Access Control</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Who can view this content?</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-1">
                    <label className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                      <input
                        type="checkbox"
                        checked={!formData.isSubscriberOnly}
                        onChange={(e) => setFormData({ ...formData, isSubscriberOnly: !e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-bold text-white group-hover:text-primary transition-colors">Free for Everyone</span>
                        <span className="block text-xs text-gray-500">Visible to all visitors</span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                      <input
                        type="checkbox"
                        checked={formData.isSubscriberOnly}
                        onChange={(e) => setFormData({ ...formData, isSubscriberOnly: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-bold text-white group-hover:text-primary transition-colors">Subscribers Only</span>
                        <span className="block text-xs text-gray-500">Premium content for members</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Media */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Cover Image <span className="text-red-500">*</span></label>
                  <div className="group relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all">
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium text-sm">Click to change</p>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-300">Upload Thumbnail</span>
                        <span className="text-xs text-gray-400 mt-1">1280x720 (16:9) recommended</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="cover-upload-new"
                      onChange={handleCoverImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      required={!coverImage}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Product File</label>
                  <div className={`relative w-full rounded-2xl overflow-hidden border-2 border-dashed transition-all ${uploading ? 'border-primary bg-primary/5' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}`}>
                    <input
                      type="file"
                      id="file-upload-new"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".zip,.pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov,.webm,.doc,.docx,.txt,.json,.js,.css,.html"
                      disabled={uploading}
                    />

                    <div className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                      {uploading ? (
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Uploading</span>
                            <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-3 animate-pulse">Please keep this window open</p>
                        </div>
                      ) : file ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                          </div>
                          <h4 className="text-white font-bold mb-1 truncate max-w-full px-4">{file.name}</h4>
                          <p className="text-xs text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button type="button" className="text-sm font-medium text-red-500 hover:text-red-700 z-20 relative" onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreview(null);
                          }}>
                            Remove File
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                          </div>
                          <h4 className="text-white font-bold mb-1">Upload Product File</h4>
                          <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                          <p className="text-xs text-gray-400 mt-4 border border-white/10 rounded-full px-3 py-1">Max 500MB • Video supported</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Guidelines */}
            <div className="px-8 pb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                  3. Copyright & DMCA Compliance
                </h4>
                <p className="text-xs leading-relaxed text-gray-400">
                  By uploading content to this platform, you certify that you own the rights to this content or have explicit permission to use it.
                  Uploading copyrighted material without permission is a violation of our terms and may result in account termination.
                  Please ensure your content adheres to all community guidelines and local laws.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={uploading || !formData.title.trim()}
                >
                  {uploading ? 'Processing...' : 'Publish Product'}
                  {!uploading && <CloudArrowUpIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-[#1a1a1a] border border-white/10 animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Success!</h3>
                <p className="text-sm text-gray-400">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4 bg-white/5 rounded-b-2xl flex justify-end border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Error Modal Component
function ErrorModal({
  isOpen,
  onClose,
  message,
  onUpgrade,
  isLimitError,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onUpgrade?: () => void;
  isLimitError?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-[#1a1a1a] border border-white/10 animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XMarkIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {isLimitError ? 'Plan Limit Reached' : 'Error'}
                </h3>
                <p className="text-sm text-gray-400">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4 bg-white/5 rounded-b-2xl flex justify-end gap-3 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 font-medium hover:bg-white/10 hover:text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {isLimitError && onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Product Edit Modal Component
function ProductEditModal({
  isOpen,
  onClose,
  product,
  channel,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  channel: any;
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    type: product?.type || 'DOCUMENTS' as ChannelProductType,
    isSubscriberOnly: product?.isSubscriberOnly || false,
    tags: product?.tags?.[0] || '',
  });
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        type: product.type || 'DOCUMENTS' as ChannelProductType,
        isSubscriberOnly: product.isSubscriberOnly || false,
        tags: product.tags?.[0] || '',
      });
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a product title');
      setShowErrorModal(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          tags: formData.tags ? [formData.tags] : [],
          isSubscriberOnly: formData.isSubscriberOnly,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update product');
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update product';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl bg-[#141414] border border-white/10 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-[#141414]/90 backdrop-blur-md z-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Product</h2>
              <p className="text-sm text-gray-500 mt-1">Update your content details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-900"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Left Column: Details */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Product Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white placeholder-gray-500 bg-white/5 transition-all font-medium"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white placeholder-gray-500 bg-white/5 transition-all resize-none"
                    placeholder="Describe your product..."
                  />
                  <p className="text-right text-xs text-gray-400 mt-2">{formData.description.length} characters</p>
                </div>
              </div>

              {/* Right Column: Settings */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Product Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ChannelProductType })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white bg-white/5 appearance-none font-medium cursor-pointer"
                    >
                      <option value="VIDEOS">Videos</option>
                      <option value="DOCUMENTS">Documents</option>
                      <option value="IMAGES">Images</option>
                      <option value="SOFTWARE">Software</option>
                      <option value="COURSES">Courses</option>
                      <option value="TEMPLATES">Templates</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Product Tag</label>
                  <div className="relative">
                    <select
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-white bg-white/5 appearance-none font-medium cursor-pointer"
                    >
                      <option value="">No Tag</option>
                      <option value="MUSIC">🎵 Music</option>
                      <option value="SPORTS">🏆 Sports</option>
                      <option value="GAMING">🎮 Gaming</option>
                      <option value="NEWS">📰 News</option>
                      <option value="LEARNING">💡 Learning</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-300">Access Control</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Who can view this content?</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-1">
                    <label className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                      <input
                        type="checkbox"
                        checked={!formData.isSubscriberOnly}
                        onChange={(e) => setFormData({ ...formData, isSubscriberOnly: !e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-bold text-white group-hover:text-primary transition-colors">Free for Everyone</span>
                        <span className="block text-xs text-gray-500">Visible to all visitors</span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                      <input
                        type="checkbox"
                        checked={formData.isSubscriberOnly}
                        onChange={(e) => setFormData({ ...formData, isSubscriberOnly: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-bold text-white group-hover:text-primary transition-colors">Subscribers Only</span>
                        <span className="block text-xs text-gray-500">Premium content for members</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Media Placeholder (Read-only for now) */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Media & Files</h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-sm text-gray-400">
                      To update the product file or cover image, please delete this product and upload a new one.
                      <br /><span className="text-xs opacity-75">(File replacement feature coming soon)</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer / Guidelines */}
            <div className="px-8 pb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                  3. Copyright & DMCA Compliance
                </h4>
                <p className="text-xs leading-relaxed text-gray-400">
                  By uploading content to this platform, you certify that you own the rights to this content or have explicit permission to use it.
                  Uploading copyrighted material without permission is a violation of our terms and may result in account termination.
                  Please ensure your content adheres to all community guidelines and local laws.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={updating || !formData.title.trim()}
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />
      )}
    </ModalPortal>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-[#1a1a1a] border border-white/10 animate-in fade-in zoom-in duration-200">
          <div className="p-6 text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete this product? This action cannot be undone and the file will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
