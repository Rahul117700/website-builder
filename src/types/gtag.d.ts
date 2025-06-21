// Type definitions for Google Analytics gtag.js
declare interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}
