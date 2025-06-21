'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GlobeAltIcon, 
  PencilIcon, 
  TrashIcon, 
  ChartBarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Site, TemplateType } from '@/types';

interface SiteCardProps {
  site: Site;
}

export default function SiteCard({ site }: SiteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getTemplateLabel = (template: TemplateType) => {
    switch (template) {
      case 'general':
        return 'General Business';
      case 'restaurant':
        return 'Restaurant';
      case 'pharma':
        return 'Pharmacy';
    }
  };

  const getTemplateColor = (template: TemplateType) => {
    switch (template) {
      case 'general':
        return 'blue';
      case 'restaurant':
        return 'orange';
      case 'pharma':
        return 'indigo';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/sites/${site.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.refresh();
        } else {
          console.error('Failed to delete site');
        }
      } catch (error) {
        console.error('Error deleting site:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const siteUrl = site.customDomain 
    ? `https://${site.customDomain}` 
    : `https://${site.subdomain}.example.com`;

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className={`h-2 bg-${getTemplateColor(site.template)}-500`}></div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{site.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getTemplateLabel(site.template)} Template
            </p>
          </div>
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              {site.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{site.customDomain || `${site.subdomain}.example.com`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
            <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            href={`/auth/dashboard/sites/${site.id}`}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
            Visit
          </a>
          <Link
            href={`/auth/dashboard/sites/${site.id}/analytics`}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <ChartBarIcon className="h-4 w-4 mr-1" />
            Analytics
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger text-sm py-1 flex items-center justify-center"
          >
            {isDeleting ? (
              <span className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <TrashIcon className="h-4 w-4 mr-1" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
