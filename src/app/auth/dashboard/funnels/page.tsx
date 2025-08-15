'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<any>(null);
  const [editFunnelModal, setEditFunnelModal] = useState(false);
  const [funnelToEdit, setFunnelToEdit] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({ name: '', slug: '', landingHtml: '', landingCss: '', landingJs: '', thankHtml: '' });
  const [form, setForm] = useState<any>({ name: '', slug: '', templateId: '', landingHtml: '<section class="container"><h1>Welcome</h1><p>Describe your offer here.</p><button id="buy">Buy Now</button></section>', landingCss: 'body{font-family:system-ui}.container{max-width:720px;margin:64px auto}', landingJs: '', thankHtml: '<h2>Thank you!</h2><p>Your purchase was successful.</p>' });
  const [templates, setTemplates] = useState<any[]>([]);
  const selectedTemplate = useMemo(()=> templates.find(t=>t.id===form.templateId),[templates, form.templateId]);

     useEffect(() => {
     async function load() {
       setLoading(true);
       const res = await fetch('/api/funnels');
       setFunnels(res.ok ? await res.json() : []);
       
       // Load templates that are on sale instead of purchased templates
       const t = await fetch('/api/sites/on-sale');
       const salesData = t.ok ? await t.json() : [];
       const templatesOnSale = salesData.map((s: any) => ({
         id: s.templateId,
         name: s.site?.name || 'Site',
         price: s.price,
         site: s.site
       }));
       setTemplates(templatesOnSale);
       setLoading(false);
     }
     load();
   }, []);

  const handleCreateFunnel = async () => {
    if (!form.templateId || !form.name || !form.slug) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/funnels', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(form) 
      });
      if (res.ok) {
        location.reload();
        toast.success('Funnel created successfully!');
      } else {
        console.error('Failed to create funnel');
        toast.error('Failed to create funnel');
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('Error creating funnel');
    } finally {
      setCreating(false);
    }
  };

  const openEditFunnelModal = (funnel: any) => {
    setFunnelToEdit(funnel);
    setEditForm({
      name: funnel.name,
      slug: funnel.slug,
      landingHtml: funnel.landingHtml,
      landingCss: funnel.landingCss,
      landingJs: funnel.landingJs,
      thankHtml: funnel.thankHtml
    });
    setEditFunnelModal(true);
  };

  const handleUpdateFunnel = async () => {
    if (!funnelToEdit || !editForm.name || !editForm.slug) return;
    
    setCreating(true);
    try {
      const res = await fetch(`/api/funnels/${funnelToEdit.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          slug: editForm.slug,
          landingHtml: editForm.landingHtml,
          landingCss: editForm.landingCss,
          landingJs: editForm.landingJs,
          thankHtml: editForm.thankHtml
        })
      });
      
      if (res.ok) {
        setEditFunnelModal(false);
        setFunnelToEdit(null);
        location.reload();
        toast.success('Funnel updated successfully!');
      } else {
        toast.error('Failed to update funnel');
      }
    } catch (error) {
      console.error('Error updating funnel:', error);
      toast.error('Error updating funnel');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFunnel = async () => {
    if (!funnelToDelete) return;
    
    try {
      const res = await fetch(`/api/funnels/${funnelToDelete.slug}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        location.reload();
        toast.success('Funnel deleted successfully');
        setDeleteConfirmModal(false);
        setFunnelToDelete(null);
      } else {
        toast.error('Failed to delete funnel');
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error('Error deleting funnel');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Marketing Funnels</h1>
        <p className="text-gray-400 text-sm">Create a landing page and thank-you flow for selling your templates with Razorpay checkout.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-gray-800 bg-black/40 p-6">
          <div className="text-white font-semibold mb-3">Your Funnels</div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : funnels.length === 0 ? (
            <div className="text-gray-400">No funnels yet.</div>
          ) : (
            <div className="space-y-3">
              {funnels.map(f => (
                <div key={f.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{f.name}</div>
                    <div className="text-gray-400 text-sm">/{f.slug} • Visits {f.visitsCount || 0} • Conversions {f.conversionsCount || 0}</div>
                  </div>
                                     <div className="flex flex-wrap gap-2">
                     <Link className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors whitespace-nowrap" href={`/f/${f.slug}`} target="_blank">Open</Link>
                     <button
                       onClick={() => {
                         const url = `${window.location.origin}/f/${f.slug}`;
                         navigator.clipboard.writeText(url);
                         toast.success('Funnel URL copied to clipboard!');
                       }}
                       className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                     >
                       📋 Copy
                     </button>
                     <button
                       onClick={() => openEditFunnelModal(f)}
                       className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors whitespace-nowrap"
                     >
                       ✏️ Edit
                     </button>
                     <button
                       onClick={() => {
                         setFunnelToDelete(f);
                         setDeleteConfirmModal(true);
                       }}
                       className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors whitespace-nowrap"
                     >
                       🗑️ Delete
                     </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-black/40 p-6 space-y-3">
          <div className="text-white font-semibold">Create Funnel</div>
          <label className="text-sm text-gray-300">Template</label>
          <select className="w-full mb-3 rounded border bg-black text-white border-gray-800 px-3 py-2" value={form.templateId} onChange={e=>setForm((s:any)=>({ ...s, templateId: e.target.value }))}>
            <option value="">Select template</option>
            {templates.map((t:any)=>(<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <label className="text-sm text-gray-300">Name</label>
          <input className="w-full mb-3 rounded border bg-black text-white border-gray-800 px-3 py-2" value={form.name} onChange={e=>setForm((s:any)=>({ ...s, name: e.target.value }))} />
          <label className="text-sm text-gray-300">Slug (public URL)</label>
          <input className="w-full mb-3 rounded border bg-black text-white border-gray-800 px-3 py-2" value={form.slug} onChange={e=>setForm((s:any)=>({ ...s, slug: e.target.value.replace(/\s+/g,'-').toLowerCase() }))} />
                     <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
             <div className="text-blue-400 text-sm mb-2">
               <strong>Note:</strong> This funnel will use our pre-designed, professional landing page template.
             </div>
             <div className="text-blue-300 text-xs">
               The page will automatically showcase your template with modern design, features list, and secure payment integration.
             </div>
           </div>
          <button 
            className={`w-full rounded font-semibold py-2 transition-all duration-200 ${
              creating 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`} 
            onClick={handleCreateFunnel}
            disabled={creating}
          >
            {creating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </div>
            ) : (
              'Create Funnel'
            )}
          </button>
                     {selectedTemplate && (
             <p className="text-xs text-gray-400">This funnel will automatically create a professional landing page for &quot;{selectedTemplate.name}&quot; with integrated payment system.</p>
                      )}
         </div>
       </div>

       {/* Delete Confirmation Modal */}
       {deleteConfirmModal && funnelToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
             <h3 className="text-xl font-semibold text-white mb-4">
               Delete Funnel
             </h3>
             <p className="text-gray-300 mb-6">
               Are you sure you want to delete the funnel &quot;{funnelToDelete.name}&quot;? This action cannot be undone.
             </p>
             <div className="flex gap-3 justify-end">
               <button
                 onClick={() => {
                   setDeleteConfirmModal(false);
                   setFunnelToDelete(null);
                 }}
                 className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleDeleteFunnel}
                 className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
               >
                 Delete Funnel
               </button>
             </div>
           </div>
         </div>
               )}

        {/* Edit Funnel Modal */}
        {editFunnelModal && funnelToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                Edit Marketing Funnel: {funnelToEdit.name}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Funnel Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                      placeholder="Enter funnel name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editForm.slug}
                                           onChange={(e) => setEditForm((prev: any) => ({ ...prev, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                     className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                     placeholder="funnel-url"
                   />
                 </div>
                 
                                   <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <div className="text-blue-400 text-sm mb-2">
                      <strong>Note:</strong> This funnel uses our pre-designed, professional landing page template.
                    </div>
                    <div className="text-blue-300 text-xs">
                      The page automatically showcases your template with modern design, features list, and secure payment integration.
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Preview */}
                <div className="space-y-4">
                  <div className="text-white font-semibold mb-2">Funnel Preview</div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-white font-medium mb-2">{funnelToEdit.name}</div>
                    <div className="text-gray-400 text-sm mb-2">Current Slug: /{funnelToEdit.slug}</div>
                    <div className="text-gray-400 text-sm mb-3">Template: {funnelToEdit.template?.site?.name || 'Unknown'}</div>
                    
                    {/* Funnel URL Preview */}
                    <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                      <span className="text-gray-400">Funnel URL:</span> {window.location.origin}/f/{editForm.slug}
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700 rounded">
                      <div className="text-blue-400 text-xs">
                        Visits: {funnelToEdit.visitsCount || 0} • Conversions: {funnelToEdit.conversionsCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setEditFunnelModal(false);
                    setFunnelToEdit(null);
                  }}
                  className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFunnel}
                  disabled={creating || !editForm.name || !editForm.slug}
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Updating...' : 'Update Funnel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }


