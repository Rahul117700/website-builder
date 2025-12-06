'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface ReCaptchaProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

/**
 * Google reCAPTCHA Component
 * Free - prevents spam and bot submissions
 * 
 * Setup:
 * 1. Get your Site Key from Google reCAPTCHA
 * 2. Add to .env: NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
 */
export default function ReCaptcha({
  siteKey,
  onVerify,
  onError,
  theme = 'light',
  size = 'normal',
}: ReCaptchaProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const key = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (key && typeof window !== 'undefined' && (window as any).grecaptcha) {
      if (recaptchaRef.current && !widgetIdRef.current) {
        widgetIdRef.current = (window as any).grecaptcha.render(recaptchaRef.current, {
          sitekey: key,
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': () => {
            if (onError) onError();
          },
          theme,
          size,
        });
      }
    }
  }, [key, onVerify, onError, theme, size]);

  const reset = () => {
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && (window as any).grecaptcha) {
      (window as any).grecaptcha.reset(widgetIdRef.current);
    }
  };

  if (!key) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded">
        reCAPTCHA not configured (NEXT_PUBLIC_RECAPTCHA_SITE_KEY missing)
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=explicit`}
        strategy="lazyOnload"
        onLoad={() => {
          // Re-render after script loads
          if (recaptchaRef.current && typeof window !== 'undefined' && (window as any).grecaptcha) {
            widgetIdRef.current = (window as any).grecaptcha.render(recaptchaRef.current, {
              sitekey: key,
              callback: (token: string) => {
                onVerify(token);
              },
              'error-callback': () => {
                if (onError) onError();
              },
              theme,
              size,
            });
          }
        }}
      />
      <div ref={recaptchaRef} className="flex justify-center" />
    </>
  );
}

/**
 * Verify reCAPTCHA token on server
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set, skipping verification');
    return true; // Allow in development
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
}

