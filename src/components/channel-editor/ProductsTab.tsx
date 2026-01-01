'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ShoppingBagIcon, XMarkIcon, CloudArrowUpIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ChannelProductType } from '@prisma/client';

interface ProductsTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function ProductsTab({ channel, onUpdate }: ProductsTabProps) {
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
      // Simulate progress for better UX (since fetch doesn't support progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Gradually increase progress, but cap at 90% until upload completes
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
      setUploadProgress(95); // Almost done

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload product');
      }
      
      setUploadProgress(100); // Complete
      
      // Small delay to show 100% before closing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh products list
      const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setShowUploadModal(false);
      setUploadProgress(0);
      // Show success modal
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

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleting(productId);
    try {
      const response = await fetch(`/api/channels/${channel.id}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete product');
      }

      // Refresh products list
      const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete product';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setDeleting(null);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Products & Content</h3>
          <p className="text-sm text-gray-600 mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'} added
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit product"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete product"
                  >
                    {deleting === product.id ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between">
                {!channel.subscriptionEnabled && (
                  <span className="text-lg font-bold text-gray-900">
                    {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '₹'}
                    {Number(product.price).toFixed(2)}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {product.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Add Products</h3>
          <p className="text-sm text-gray-600 mb-6">
            Products will be displayed in a beautiful grid on your channel
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Add Your First Product
          </button>
        </div>
      )}

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
            // Refresh products list
            const productsResponse = await fetch(`/api/channels/${channel.id}/products`);
            if (productsResponse.ok) {
              const updatedProducts = await productsResponse.json();
              setProducts(updatedProducts);
            }
            setShowEditModal(false);
            setEditingProduct(null);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message="Product uploaded successfully!"
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
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
    tags: '',
    isSubscriberOnly: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'DOCUMENTS' as ChannelProductType,
        tags: '',
        isSubscriberOnly: false,
      });
      setFile(null);
      setPreview(null);
    }
  }, [isOpen]);

  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - these will be handled by the error modal
    if (!formData.title.trim()) {
      setErrorMessage('Please enter a product title');
      setShowErrorModal(true);
      return;
    }


    if (!file && !formData.description.trim()) {
      setErrorMessage('Please either upload a file or provide a description');
      setShowErrorModal(true);
      return;
    }

    // Validate file size if file exists
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
    uploadFormData.append('tags', formData.tags);
    uploadFormData.append('isFree', 'true');
    uploadFormData.append('isSubscriberOnly', formData.isSubscriberOnly.toString());
    
    if (file) {
      uploadFormData.append('file', file);
    }

    onUpload(uploadFormData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (selectedFile.size > maxSize) {
        setErrorMessage(`File size (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB) exceeds 500MB limit`);
        setShowErrorModal(true);
        e.target.value = ''; // Clear the input
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Enter product title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Describe your product"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Product Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ChannelProductType })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="DOCUMENTS">Documents</option>
              <option value="VIDEOS">Videos</option>
              <option value="IMAGES">Images</option>
              <option value="SOFTWARE">Software</option>
              <option value="CODE">Code</option>
              <option value="COURSES">Courses</option>
              <option value="TEMPLATES">Templates</option>
              <option value="OTHER">Other</option>
            </select>
          </div>


          {/* Subscriber Only Checkbox */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSubscriberOnly"
                checked={formData.isSubscriberOnly}
                onChange={(e) => setFormData({ ...formData, isSubscriberOnly: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <label htmlFor="isSubscriberOnly" className="text-sm font-medium text-gray-700">
                Subscriber Only
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Important:</span> If this checkbox is <span className="font-semibold">not selected</span>, the product will be <span className="font-semibold">free for all users</span> to view and access.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Product File
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".zip,.pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov,.webm,.doc,.docx,.txt,.json,.js,.css,.html"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center gap-2 ${uploading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                {uploading ? (
                  <>
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#9333ea"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">{uploadProgress}%</span>
                      </div>
                    </div>
                    <span className="text-sm text-purple-700 font-semibold">
                      Uploading video...
                    </span>
                    <span className="text-xs text-purple-600">
                      Please don't close this window
                    </span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </span>
                    {file && (
                      <span className="text-xs text-gray-500">
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Max 500MB (Videos Supported!)
                    </span>
                  </>
                )}
              </label>
              
              {/* Upload Progress Bar */}
              {uploading && (
                <div className="mt-4 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-700">Upload Progress</span>
                    <span className="text-xs font-bold text-purple-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {preview && !uploading && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-black flex items-center justify-center gap-2"
              disabled={uploading || !formData.title.trim()}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Success!
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Error Modal Component
function ErrorModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Error
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
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
    tags: product?.tags?.join(', ') || '',
    isSubscriberOnly: product?.isSubscriberOnly || false,
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
        tags: product.tags?.join(', ') || '',
        isSubscriberOnly: product.isSubscriberOnly || false,
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
          tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="Enter product title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="Describe your product"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Product Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ChannelProductType })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="DOCUMENTS">Documents</option>
                <option value="VIDEOS">Videos</option>
                <option value="IMAGES">Images</option>
                <option value="SOFTWARE">Software</option>
                <option value="CODE">Code</option>
                <option value="COURSES">Courses</option>
                <option value="TEMPLATES">Templates</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Subscriber Only Checkbox */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsSubscriberOnly"
                  checked={formData.isSubscriberOnly}
                  onChange={(e) => setFormData({ ...formData, isSubscriberOnly: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="editIsSubscriberOnly" className="text-sm font-medium text-gray-700">
                  Subscriber Only
                </label>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Important:</span> If this checkbox is <span className="font-semibold">not selected</span>, the product will be <span className="font-semibold">free for all users</span> to view and access.
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 hover:bg-black flex items-center justify-center gap-2"
                disabled={updating || !formData.title.trim()}
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />
      )}
    </>
  );
}
