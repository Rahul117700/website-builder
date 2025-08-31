"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, UsersIcon, CurrencyDollarIcon, CogIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    title: "Manage Pages",
    description: "Easily add, edit, and organize your website pages with our intuitive editor.",
    icon: <BookOpenIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />,
  },
  {
    title: "User Management",
    description: "Monitor and manage user accounts, roles, and permissions across your platform.",
    icon: <UsersIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />,
  },
  {
    title: "Revenue Tracking",
    description: "Track payments, subscriptions, and revenue analytics in real-time.",
    icon: <CurrencyDollarIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />,
  },
  {
    title: "Platform Settings",
    description: "Configure platform-wide settings, integrations, and system preferences.",
    icon: <CogIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />,
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
            <div className="text-lg text-gray-600">
              {steps[step].icon}
              <span className="block text-xl font-semibold text-indigo-600 mb-3">{steps[step].title}</span>
              <span className="text-gray-600 leading-relaxed">{steps[step].description}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <Button 
              onClick={handleNext} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-lg min-w-[140px] transform hover:scale-105 transition-all duration-200"
            >
              {step === steps.length - 1 ? "Finish" : "Next"}
            </Button>
            <div className="flex justify-center gap-4">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full transition-all duration-200 ${
                    i === step ? "bg-indigo-600 scale-110" : "bg-gray-300"
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