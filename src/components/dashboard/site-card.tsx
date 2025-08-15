'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GlobeAltIcon, 
  PencilIcon, 
  TrashIcon, 
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  CodeBracketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Site, TemplateType } from '@/types';
import toast from 'react-hot-toast';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface SiteCardProps {
  site: Site;
  mainPageRenderMode?: string;
  onEdit?: (site: Site) => void;
  onChangeTemplate?: (site: Site) => void;
  onDelete?: () => void;
}

export default function SiteCard({ site, mainPageRenderMode, onEdit, onChangeTemplate, onDelete }: SiteCardProps) {
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
          toast.success('Website deleted successfully');
          if (onDelete) onDelete();
        } else {
          const err = await response.json();
          toast.error(err.error || 'Failed to delete site');
        }
      } catch (error: any) {
        toast.error(error.message || 'Error deleting site');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAnalytics = () => {
    router.push(`/auth/dashboard/analytics?siteId=${site.id}`);
  };

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const siteUrl = site.customDomain 
    ? `https://${site.customDomain}` 
    : `${BASE_URL}/s/${site.subdomain}`;

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className={`h-2 bg-${getTemplateColor(site.template)}-500`}></div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {site.name}
              {(site as any).onSale && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-semibold">
                  <LocalOfferIcon sx={{ fontSize: 14 }} /> On Sale
                </span>
              )}
              {/* {mainPageRenderMode === 'react' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-semibold">
                  <SparklesIcon className="h-4 w-4" /> React (JSX)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                  <CodeBracketIcon className="h-4 w-4" /> HTML/CSS/JS
                </span>
              )} */}
            </h3>
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
            <span className="truncate">{site.customDomain || `${BASE_URL}/s/${site.subdomain}`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
            <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit && onEdit(site)}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
            Visit
          </a>
          <button
            onClick={handleAnalytics}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <ChartBarIcon className="h-4 w-4 mr-1" />
            Analytics
          </button>
          <Link
            href={`/auth/dashboard/sites/${site.id}/pages`}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
            Manage Pages
          </Link>
          {(site as any).onSale ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/sites/on-sale', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ siteId: site.id })
                  });
                  if (res.ok) {
                    toast.success('Listing removed');
                    if (onEdit) onEdit(site);
                  } else {
                    const data = await res.json();
                    toast.error(data.error || 'Failed to remove listing');
                  }
                } catch (e: any) {
                  toast.error(e.message || 'Failed to remove listing');
                }
              }}
              className="btn-secondary text-sm py-1 flex items-center justify-center"
            >
              Remove from Sale
            </button>
          ) : null}
          <button
            onClick={() => onChangeTemplate && onChangeTemplate(site)}
            className="btn-secondary text-sm py-1 flex items-center justify-center"
          >
            Change Template
          </button>
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
