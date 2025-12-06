'use client';

import React from 'react';
import ModernFunnelTemplate from '@/components/templates/ModernFunnelTemplate';

interface FunnelPreviewLayoutProps {
  funnel: any;
  customizations: any;
  sellerInfo: any;
  productDetails: any;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  isPreview?: boolean;
}

export default function FunnelPreviewLayout({
  funnel,
  customizations,
  sellerInfo,
  productDetails,
  previewMode = 'desktop',
  isPreview = true,
}: FunnelPreviewLayoutProps) {
  return (
    <div className="@container w-full h-full" style={{ containerType: 'inline-size' }}>
      <ModernFunnelTemplate
        funnel={funnel}
        customizations={customizations}
        sellerInfo={sellerInfo}
        productDetails={productDetails}
        isPreview={isPreview}
        onPurchase={() => { }}
      />
    </div>
  );
}
