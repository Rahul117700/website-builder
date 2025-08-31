"use client";
import React from 'react';
import type { Site } from '@/types/prisma';

interface SiteViewerProps {
  site: Site;
  currentSlug: string;
}

export default function SiteViewer({ site }: SiteViewerProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{site.name}</h1>
        <p className="text-gray-600 mb-6">{site.description}</p>
        <p className="text-sm text-gray-500">Site: {site.subdomain}</p>
        <div className="mt-8 text-gray-500">
          <p>Site is under construction</p>
        </div>
      </div>
    </div>
  );
}
