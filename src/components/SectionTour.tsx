'use client';

import { useEffect, useState } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

interface SectionTourProps {
  run: boolean;
  onFinish: () => void;
  steps: Array<{
    selector: string;
    content: React.ReactElement | string;
    beforeScroll?: () => Promise<void>;
    afterOpen?: () => void;
  }>;
  title: string;
}

function TourContent({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (run) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [run, setIsOpen, setCurrentStep]);

  return null;
}

export default function SectionTour({ run, onFinish, steps, title }: SectionTourProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base: any) => ({
          ...base,
          '--reactour-accent': '#4F46E5',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '450px',
          maxHeight: '80vh',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        }),
        popoverContent: (base: any) => ({
          ...base,
          maxHeight: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: '1 1 auto',
          marginBottom: '0',
          paddingBottom: '0',
        }),
        maskArea: (base: any) => ({
          ...base,
          rx: 8,
        }),
        badge: (base: any) => ({
          ...base,
          left: 'auto',
          right: '-0.8125em',
        }),
        controls: (base: any) => ({
          ...base,
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          background: '#FFFFFF',
          zIndex: 10,
        }),
        close: (base: any) => ({
          ...base,
          right: '1em',
          top: '1em',
          color: '#6B7280',
        }),
      } as any}
      prevButton={({ currentStep, stepsLength, setCurrentStep }) => (
        <button
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            }
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentStep === 0}
        >
          Back
        </button>
      )}
      nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => (
        <button
          onClick={() => {
            if (currentStep < stepsLength - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              setIsOpen(false);
              onFinish();
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          {currentStep === stepsLength - 1 ? 'Finish' : 'Next'}
        </button>
      )}
      onClickMask={({ setIsOpen }) => {
        setIsOpen(false);
        onFinish();
      }}
      disableInteraction={false}
      showNavigation={true}
      showBadge={true}
      showCloseButton={true}
      className="reactour-portal"
      padding={{ mask: 10, popover: [10, 10] }}
    >
      <TourContent run={run} onFinish={onFinish} />
    </TourProvider>
  );
}

