"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, CalendarIcon, ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    title: "Manage Pages",
    description: "Easily add, edit, and organize your website pages with our intuitive editor.",
    icon: <BookOpenIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />,
  },
  {
    title: "Add Bookings",
    description: "Accept and manage bookings or appointments directly from your dashboard.",
    icon: <CalendarIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />,
  },
  {
    title: "View Analytics",
    description: "Track visitors, page views, and user behavior with built-in analytics.",
    icon: <ChartBarIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />,
  },
  {
    title: "Connect Domain",
    description: "Connect your custom domain and go live with a professional web address.",
    icon: <GlobeAltIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</DialogTitle>
          <DialogDescription className="text-center text-gray-500 mb-4">
            {steps[step].icon}
            <span className="block text-lg font-semibold text-purple-600 mb-1">{steps[step].title}</span>
            <span>{steps[step].description}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center mt-4">
          <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold">
            {step === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </DialogFooter>
        <div className="flex justify-center gap-2 mt-4">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === step ? "bg-purple-600" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 