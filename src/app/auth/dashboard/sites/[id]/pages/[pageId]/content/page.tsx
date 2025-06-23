"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layouts/dashboard-layout";

interface Block {
  id: string;
  type: string;
  content: string;
  imageUrl?: string;
  order: number;
}

export default function PageContentBlocks() {
  const params = useParams();
  const siteId = params?.id as string;
  const pageId = params?.pageId as string;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId || !pageId) return;
    setLoading(true);
    fetch(`/api/blocks?siteId=${siteId}&pageId=${pageId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token') || '',
      },
    })
      .then(res => res.json())
      .then(data => {
        setBlocks(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch content blocks");
        setLoading(false);
      });
  }, [siteId, pageId]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Content Blocks</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Add, edit, delete, or reorder content blocks for this page.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Content Blocks</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            Add Block
          </button>
        </div>
        {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
        {loading ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <span className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full inline-block mb-2"></span>
            <div className="text-gray-500 dark:text-gray-400">Loading content blocks...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No content blocks yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new content block.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.sort((a, b) => a.order - b.order).map(block => (
              <div key={block.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">{block.type}</div>
                  {block.type === 'image' ? (
                    <img src={block.imageUrl} alt="Block" className="h-16 rounded" />
                  ) : (
                    <div className="text-gray-900 dark:text-white line-clamp-2 max-w-md">{block.content}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs">Edit</button>
                  <button className="btn-danger text-xs">Delete</button>
                  <button className="btn-secondary text-xs">Up</button>
                  <button className="btn-secondary text-xs">Down</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 