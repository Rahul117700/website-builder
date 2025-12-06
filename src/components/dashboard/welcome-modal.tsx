"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, UsersIcon, CurrencyDollarIcon, CogIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    title: "Build Sales Funnels",
    description: "Create high-converting sales funnels with our drag-and-drop funnel builder. From lead capture to checkout - everything you need.",
    icon: <BookOpenIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />,
  },
  {
    title: "Lead Management",
    description: "Capture, nurture, and convert leads with our powerful lead management system and email automation.",
    icon: <UsersIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />,
  },
  {
    title: "Revenue Optimization",
    description: "Track conversions, revenue, and optimize your funnels with detailed analytics and A/B testing tools.",
    icon: <CurrencyDollarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />,
  },
  {
    title: "Template Library",
    description: "Choose from hundreds of proven funnel templates or create your own with our advanced customization options.",
    icon: <CogIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />,
  },
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-100 bg-opacity-80 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Funnel Command Center</h2>
            <div className="text-lg text-gray-600">
              {steps[step].icon}
              <span className="block text-xl font-semibold text-purple-600 mb-3">{steps[step].title}</span>
              <span className="text-gray-600 leading-relaxed">{steps[step].description}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <Button 
              onClick={handleNext} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-semibold text-lg min-w-[140px] transform hover:scale-105 transition-all duration-200"
            >
              {step === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
            <div className="flex justify-center gap-4">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full transition-all duration-200 ${
                    i === step ? "bg-purple-600 scale-110" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 