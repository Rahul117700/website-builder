'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  CreditCardIcon,
  RocketLaunchIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface FunnelCreationWizardProps {
  funnelId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  required: boolean;
}

export default function FunnelCreationWizard({ funnelId, onClose, onComplete }: FunnelCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    fileUrl: '',
    fileSize: 0,
    fileType: '',
  });

  const [sellerData, setSellerData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [paymentConfigured, setPaymentConfigured] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Product Details',
      description: 'Add your product information',
      icon: DocumentTextIcon,
      completed: productData.name !== '' && productData.price !== '',
      required: true,
    },
    {
      id: 2,
      title: 'Upload Product File',
      description: 'Upload your digital product',
      icon: PhotoIcon,
      completed: productData.fileUrl !== '',
      required: true,
    },
    {
      id: 3,
      title: 'Seller Information',
      description: 'Add your business details',
      icon: InformationCircleIcon,
      completed: sellerData.name !== '' && sellerData.email !== '',
      required: true,
    },
    {
      id: 4,
      title: 'Payment Gateway',
      description: 'Configure payment settings',
      icon: CreditCardIcon,
      completed: paymentConfigured,
      required: true,
    },
    {
      id: 5,
      title: 'Publish',
      description: 'Launch your funnel',
      icon: RocketLaunchIcon,
      completed: false,
      required: false,
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const canProceed = currentStepData.completed || !currentStepData.required;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProductSave = async () => {
    if (!productData.name || !productData.price) {
      toast.error('Please fill in product name and price');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
        }),
      });

      if (!response.ok) throw new Error('Failed to save product');

      toast.success('Product details saved!');
      handleNext();
    } catch (error) {
      toast.error('Failed to save product details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size: 500MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('funnelId', funnelId);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProductData({
        ...productData,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
      });

      toast.success('File uploaded successfully!');
      handleNext();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSave = async () => {
    if (!sellerData.name || !sellerData.email) {
      toast.error('Please fill in seller name and email');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}/seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData),
      });

      if (!response.ok) throw new Error('Failed to save seller info');

      toast.success('Seller information saved!');
      handleNext();
    } catch (error) {
      toast.error('Failed to save seller information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentConfig = async () => {
    try {
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      setPaymentConfigured(data.hasConfig);
      
      if (data.hasConfig) {
        toast.success('Payment gateway is configured!');
        handleNext();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePublish = async () => {
    // Verify all steps are complete
    const allCompleted = steps.slice(0, 4).every(step => step.completed);
    
    if (!allCompleted) {
      toast.error('Please complete all required steps before publishing');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish');
      }

      toast.success('🎉 Funnel published successfully!');
      onComplete();
      router.push(`/dashboard/funnels/${funnelId}/customize`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish funnel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Funnel Setup Wizard</h2>
              <p className="text-purple-100 text-sm">Follow these steps to create your funnel</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Product Information</h3>
                  <p className="text-sm text-blue-700">Tell customers about your digital product</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="e.g., Ultimate Marketing Course"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                  placeholder="999"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  placeholder="Describe what customers will get..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <button
                onClick={handleProductSave}
                disabled={loading || !productData.name || !productData.price}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Upload Your Product</h3>
                  <p className="text-sm text-blue-700">Upload the file customers will receive after purchase</p>
                </div>
              </div>

              {productData.fileUrl ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">File Uploaded Successfully!</p>
                      <p className="text-sm text-green-700">
                        Size: {(productData.fileSize / (1024 * 1024)).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Continue to Next Step
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="product-file"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="product-file"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports: PDF, Video, Images, ZIP, etc. (Max: 500MB)
                      </p>
                    </div>
                    {loading && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        <span>Uploading...</span>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Seller Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Seller Information</h3>
                  <p className="text-sm text-blue-700">Your business/contact details for customers</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name / Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sellerData.name}
                  onChange={(e) => setSellerData({ ...sellerData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={sellerData.email}
                  onChange={(e) => setSellerData({ ...sellerData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={sellerData.phone}
                  onChange={(e) => setSellerData({ ...sellerData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You (Optional)
                </label>
                <textarea
                  value={sellerData.bio}
                  onChange={(e) => setSellerData({ ...sellerData, bio: e.target.value })}
                  placeholder="Tell customers about yourself or your business..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                />
              </div>

              <button
                onClick={handleSellerSave}
                disabled={loading || !sellerData.name || !sellerData.email}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          )}

          {/* Step 4: Payment Gateway */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Payment Gateway</h3>
                  <p className="text-sm text-blue-700">Configure Razorpay to accept payments</p>
                </div>
              </div>

              {paymentConfigured ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Payment Gateway Configured!</p>
                      <p className="text-sm text-green-700">You're ready to accept payments</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Continue to Publish
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-2">Payment Gateway Required</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          You need to configure your Razorpay account to accept payments from customers.
                        </p>
                        <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
                          <li>Create a Razorpay account at razorpay.com</li>
                          <li>Get your API Key ID and Secret from Dashboard</li>
                          <li>Add them in Settings → Payment Configuration</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open('/auth/dashboard/settings', '_blank')}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Configure Payment Gateway
                    </button>
                    <button
                      onClick={checkPaymentConfig}
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      {loading ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Publish */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900">Ready to Launch!</h3>
                  <p className="text-sm text-purple-700">Everything is set up. Publish your funnel now!</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Setup Summary:</h4>
                {steps.slice(0, 4).map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className={step.completed ? 'text-gray-700' : 'text-red-600'}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePublish}
                disabled={loading || !steps.slice(0, 4).every(s => s.completed)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Publishing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RocketLaunchIcon className="h-6 w-6" />
                    Publish Funnel
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length || !canProceed}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

