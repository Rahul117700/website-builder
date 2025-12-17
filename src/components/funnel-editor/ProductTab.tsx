import React, { useState } from 'react';
import {
    ShoppingBagIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProductTabProps {
    productDetails: any;
    setProductDetails: (details: any) => void;
    setFunnel: (funnel: any) => void;
    funnel: any;
    setRefreshKey: (key: any) => void;
}

export default function ProductTab({
    productDetails,
    setProductDetails,
    setFunnel,
    funnel,
    setRefreshKey
}: ProductTabProps) {
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [deletingFile, setDeletingFile] = useState(false);

    const handleAiGenerate = async (type: string, currentContent: string) => {
        if (!productDetails.name) {
            toast.error('Please enter a product name first');
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading('Generating content...');

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Product: ${productDetails.name}. Current description: ${currentContent}`,
                    type
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to generate');

            if (type === 'description') {
                setProductDetails({ ...productDetails, description: data.content });
            }

            toast.success('Generated!', { id: toastId });
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('Failed to generate content', { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // File size validation (500MB limit)
        const fileSize = file.size / (1024 * 1024); // Convert to MB
        if (file.size > 500 * 1024 * 1024) {
            toast.error(`File size is ${fileSize.toFixed(2)}MB. Maximum allowed is 500MB. Please compress or reduce the file size.`, {
                duration: 5000,
            });
            return;
        }

        if (!productDetails.name || !productDetails.price) {
            toast.error('Please fill in product name and price first');
            return;
        }

        try {
            setUploadingFile(true);
            setUploadProgress(10); // Start progress

            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', productDetails.name);
            formData.append('description', productDetails.description);
            formData.append('price', productDetails.price);
            formData.append('currency', 'INR');

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const response = await fetch('/api/products/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (response.ok) {
                setUploadProgress(100);
                const data = await response.json();

                // Update product details with the uploaded file
                const updatedProductDetails = {
                    ...productDetails,
                    file,
                    fileUrl: data.fileUrl || `/uploads/products/${file.name}`,
                };

                setProductDetails(updatedProductDetails);

                // Also update the funnel with the new product data
                if (funnel) {
                    setFunnel({
                        ...funnel,
                        product: {
                            ...updatedProductDetails,
                            id: data.id,
                        }
                    });
                }

                toast.success('Product file uploaded successfully!');
                setRefreshKey((prev: number) => prev + 1);
            } else {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Upload error:', error);
                toast.error(`❌ Upload failed: ${error.error || error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading product:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
            toast.error(`❌ Failed to upload product file: ${errorMessage}`);
        } finally {
            setUploadingFile(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveProductFile = async () => {
        if (!confirm('Are you sure you want to remove this product file? This will delete the file from storage.')) {
            return;
        }

        try {
            setDeletingFile(true);

            // Get the file URL to delete
            const fileUrl = productDetails.fileUrl;

            if (fileUrl) {
                // Call API to delete the file
                const response = await fetch('/api/products/delete-file', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileUrl }),
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('Delete error:', error);
                    toast.error(`Failed to delete file: ${error.error || 'Unknown error'}`);
                    return;
                }

                toast.success('Product file deleted successfully!');
            }

            // Clear the product details
            setProductDetails({ ...productDetails, fileUrl: '', file: null });
            setRefreshKey((prev: number) => prev + 1);
        } catch (error) {
            console.error('Error deleting product file:', error);
            toast.error('Failed to delete product file. Please try again.');
        } finally {
            setDeletingFile(false);
        }
    };

    return (
        <>
            {/* Upload Progress Overlay */}
            {uploadingFile && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
                        <div className="text-center">
                            {/* Animated Upload Icon */}
                            <div className="relative mb-6">
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                                <ArrowUpTrayIcon className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>

                            {/* Upload Status */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Uploading Product</h3>
                            <p className="text-sm text-gray-600 mb-4">Please wait while we upload your file...</p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-bold text-purple-600">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* File Info */}
                            {productDetails.file && (
                                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Uploading:</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{productDetails.name}</p>
                                </div>
                            )}

                            {/* Don't close warning */}
                            <p className="text-xs text-gray-500 mt-4">⚠️ Please don't close this window</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4" data-tour="product-tab">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Product Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={productDetails.name}
                    onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                    placeholder="Enter product name"
                    maxLength={100}
                />
            </div >

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-black">Description</label>
                    <button
                        onClick={() => handleAiGenerate('description', productDetails.description)}
                        disabled={isGenerating || !productDetails.name}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={!productDetails.name ? "Enter product name first" : "Generate with AI"}
                    >
                        {isGenerating ? (
                            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <SparklesIcon className="w-3 h-3" />
                        )}
                        Fill with AI
                    </button>
                </div>
                <textarea
                    value={productDetails.description}
                    onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-black"
                    placeholder="Product description"
                    maxLength={500}
                />
                <p className="text-xs text-black mt-1">{productDetails.description.length}/500</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Price (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black font-medium">₹</span>
                    <input
                        type="number"
                        value={productDetails.price}
                        onChange={(e) => setProductDetails({ ...productDetails, price: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-black"
                        placeholder="99"
                        min="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-black mb-2">Product Type</label>
                <select
                    value={productDetails.type}
                    onChange={(e) => setProductDetails({ ...productDetails, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm text-black"
                >
                    <option value="SOFTWARE">💻 Software/App</option>
                    <option value="CODE">👨‍💻 Source Code</option>
                    <option value="DOCUMENTS">📄 Documents</option>
                    <option value="IMAGES">🖼️ Images</option>
                    <option value="VIDEOS">🎥 Videos</option>
                    <option value="COURSE">🎓 Course</option>
                </select>
            </div>

            {/* Product File Upload */}
            <div data-tour="product-file-upload">
                <label className="block text-sm font-medium text-black mb-2">
                    Product File <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-2 flex items-start gap-1">
                    <InformationCircleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Upload your digital product file. This will be delivered to customers after purchase.
                </p>

                {!productDetails.name || !productDetails.price ? (
                    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center cursor-not-allowed opacity-75">
                        <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500">Please enter Name and Price to unlock upload</p>
                    </div>
                ) : productDetails.fileUrl ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-green-800">File uploaded successfully!</p>
                                    <p className="text-xs text-black truncate">{productDetails.file?.name || 'Product file'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveProductFile}
                                disabled={deletingFile}
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {deletingFile ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Remove'
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-green-700 flex items-center gap-1">
                            ✓ You can now publish your funnel
                        </p>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all relative"
                        onClick={() => {
                            if (uploadingFile) return;
                            const fileInput = document.getElementById('product-file-upload') as HTMLInputElement;
                            if (fileInput) fileInput.click();
                        }}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs font-medium text-black">Click to upload file</p>
                            <p className="text-xs text-black font-semibold text-green-600">Max 500MB (Videos Supported!)</p>
                            <p className="text-xs text-gray-500 mt-1">ZIP, PDF, Images, Videos, Documents</p>
                            <p className="text-xs text-gray-400 mt-1">Supported: .mp4, .webm, .avi, .mov, .zip, .pdf, .jpg, .png</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleProductFileUpload}
                            disabled={uploadingFile}
                            accept=".zip,.pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov,.wmv,.flv,.webm,.doc,.docx,.ppt,.pptx,.txt,.json,.js,.css,.html"
                            id="product-file-upload"
                        />
                    </div>
                )}
            </div>
        </div >
        </>
    );
}
