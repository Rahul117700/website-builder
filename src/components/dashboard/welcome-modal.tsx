"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    title: "👋 Welcome to SellEarnDirect!",
    content: (
      <div className="space-y-6">
        <div className="border-2 border-green-500 rounded-xl p-6 bg-green-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            💰 Earn Lakhs to Crores - Turn Your Expertise Into Income!
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            Join thousands of entrepreneurs earning ₹15 Lakhs to ₹45 Lakhs+ in just 6-12 months by selling digital products. From courses to software, turn what you know into a profitable business!
          </p>
        </div>
        
        <div className="border-2 border-blue-500 rounded-xl p-6 bg-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            💳 Direct Payments - Zero Middleman Fees!
          </h3>
          <p className="text-sm text-gray-700">
            Receive 85% of all subscription payments directly to your bank account. No hidden fees, no middlemen - just pure earnings!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "How It Works: 5 Simple Steps",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">1</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Create Channel</h4>
              <p className="text-sm text-gray-600">Sign up & start building your branded channel</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">2</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Add Product</h4>
              <p className="text-sm text-gray-600">Upload your digital files (videos, PDFs, courses, software)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">3</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Customize</h4>
              <p className="text-sm text-gray-600">Design your page with professional branding</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">4</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Publish</h4>
              <p className="text-sm text-gray-600">Go live instantly with your channel</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">5</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Get Sales</h4>
              <p className="text-sm text-gray-600">Enable subscriptions, promote, and start earning!</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "What You Can Share",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 text-center mb-4">
          Share unlimited content types on your subscription channel:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">📄</span>
            <p className="text-sm font-medium">Documents & PDFs</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">🎥</span>
            <p className="text-sm font-medium">Videos</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">📚</span>
            <p className="text-sm font-medium">Online Courses</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">💻</span>
            <p className="text-sm font-medium">Software & Code</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">🎨</span>
            <p className="text-sm font-medium">Templates</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <span className="text-2xl mb-2 block">📖</span>
            <p className="text-sm font-medium">E-books</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Start Your Journey Today! 🚀",
    content: (
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Create Your Channel?</h3>
          <p className="text-gray-700 mb-4">
            Creating a subscription-based channel is free and takes just minutes. No technical skills required!
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Free channel creation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Professional templates included</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Direct bank payments (85% to you)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Unlimited content uploads</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
];

export function WelcomeModal({ open: controlledOpen, setOpen: controlledSetOpen, forceShow }: { open?: boolean, setOpen?: (open: boolean) => void, forceShow?: boolean } = {}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : setInternalOpen;

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("welcomeModalSeen");
      if ((!seen && !forceShow) || (forceShow && controlledOpen)) setOpen(true);
    }
  }, [forceShow, controlledOpen, setOpen]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("welcomeModalSeen", "true");
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("welcomeModalSeen", "true");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-100 bg-opacity-80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {steps[step].title}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-8 min-h-[300px]">
            {steps[step].content}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                step === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
            
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    i === step ? "bg-purple-600 scale-125" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button 
              onClick={handleNext} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold min-w-[120px] transform hover:scale-105 transition-all duration-200"
            >
              {step === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 