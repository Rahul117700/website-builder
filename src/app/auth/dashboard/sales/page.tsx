'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { RocketLaunchIcon, EyeIcon, PencilIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SalesDashboard() {
  const [sales, setSales] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [funnels, setFunnels] = useState<any[]>([]);
  const [createFunnelModal, setCreateFunnelModal] = useState(false);
  const [editFunnelModal, setEditFunnelModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [funnelToEdit, setFunnelToEdit] = useState<any>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [funnelForm, setFunnelForm] = useState({
    name: '',
    slug: '',
    landingHtml: '<section class="container"><h1>Welcome</h1><p>Describe your offer here.</p><button id="buy">Buy Now</button></section>',
    landingCss: 'body{font-family:system-ui}.container{max-width:720px;margin:64px auto}',
    landingJs: '',
    thankHtml: '<h2>Thank you!</h2><p>Your purchase was successful.</p>'
  });
  const [creatingFunnel, setCreatingFunnel] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/sites/on-sale');
        const salesData = res.ok ? await res.json() : [];
        setSales(salesData);
        
        const eRes = await fetch('/api/users/earnings');
        const eData = eRes.ok ? await eRes.json() : { total: 0 };
        setEarnings(eData.total || 0);
        
        // Load funnels to show connections
        const fRes = await fetch('/api/funnels');
        const funnelsData = fRes.ok ? await fRes.json() : [];
        setFunnels(funnelsData);

        // Load notifications
        const nRes = await fetch('/api/notifications');
        const notificationsData = nRes.ok ? await nRes.json() : [];
        setNotifications(notificationsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handle click outside notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getConnectedFunnel = (templateId: string) => {
    return funnels.find(f => f.templateId === templateId);
  };

  const openCreateFunnelModal = (sale: any) => {
    // Create a template object that matches the expected structure
    const template = {
      id: sale.templateId,
      name: sale.site?.name || 'Site',
      price: sale.price,
      site: sale.site
    };
    setSelectedTemplate(template);
    setFunnelForm({
      name: template.name + ' Marketing Funnel',
      slug: template.name.toLowerCase().replace(/\s+/g, '-') + '-funnel',
      landingHtml: '<section class="container"><h1>Welcome</h1><p>Describe your offer here.</p><button id="buy">Buy Now</button></section>',
      landingCss: 'body{font-family:system-ui}.container{max-width:720px;margin:64px auto}',
      landingJs: '',
      thankHtml: '<h2>Thank you!</h2><p>Your purchase was successful.</p>'
    });
    setCreateFunnelModal(true);
  };

  const openEditFunnelModal = (funnel: any) => {
    setFunnelToEdit(funnel);
    setFunnelForm({
      name: funnel.name,
      slug: funnel.slug,
      landingHtml: funnel.landingHtml,
      landingCss: funnel.landingCss,
      landingJs: funnel.landingJs,
      thankHtml: funnel.thankHtml
    });
    setEditFunnelModal(true);
  };

  // Get templates that are on sale for the dropdown
  const getTemplatesOnSale = () => {
    return sales.map(s => ({
      id: s.templateId,
      name: s.site?.name || 'Site',
      price: s.price,
      site: s.site
    }));
  };

    const handleCreateFunnel = async () => {
    if (!selectedTemplate || !funnelForm.name || !funnelForm.slug) return;
    
    setCreatingFunnel(true);
    try {
      const res = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...funnelForm,
          templateId: selectedTemplate.id
        })
      });
      
             if (res.ok) {
         setCreateFunnelModal(false);
         setSelectedTemplate(null);
         // Reload funnels and sales data
         const fRes = await fetch('/api/funnels');
         const funnelsData = fRes.ok ? await fRes.json() : [];
         setFunnels(funnelsData);
         toast.success('Funnel created successfully!');
         
         // Create notification
         await createNotification('funnel_created', `Marketing funnel "${funnelForm.name}" created successfully!`);
       } else {
        toast.error('Failed to create funnel');
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('Error creating funnel');
    } finally {
      setCreatingFunnel(false);
    }
  };

    const handleDeleteFunnel = async () => {
    if (!funnelToDelete) return;
    
    try {
      const res = await fetch(`/api/funnels/${funnelToDelete.slug}`, {
        method: 'DELETE'
      });
      
              if (res.ok) {
          // Reload funnels and sales data
          const fRes = await fetch('/api/funnels');
          const funnelsData = fRes.ok ? await fRes.json() : [];
          setFunnels(funnelsData);
          toast.success('Funnel deleted successfully');
          setDeleteConfirmModal(false);
          setFunnelToDelete(null);
          
          // Create notification
          await createNotification('funnel_deleted', `Marketing funnel "${funnelToDelete.name}" deleted successfully!`);
        } else {
          toast.error('Failed to delete funnel');
        }
      } catch (error) {
        console.error('Error deleting funnel:', error);
        toast.error('Error deleting funnel');
      }
    };

  const handleUpdateFunnel = async () => {
    if (!funnelToEdit || !funnelForm.name || !funnelForm.slug) return;
    
    setCreatingFunnel(true);
    try {
      const res = await fetch(`/api/funnels/${funnelToEdit.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: funnelForm.name,
          slug: funnelForm.slug,
          landingHtml: funnelForm.landingHtml,
          landingCss: funnelForm.landingCss,
          landingJs: funnelForm.landingJs,
          thankHtml: funnelForm.thankHtml
        })
      });
      
      if (res.ok) {
        setEditFunnelModal(false);
        setFunnelToEdit(null);
        // Reload funnels and sales data
        const fRes = await fetch('/api/funnels');
        const funnelsData = fRes.ok ? await fRes.json() : [];
        setFunnels(funnelsData);
        toast.success('Funnel updated successfully!');
        
        // Create notification
        await createNotification('funnel_updated', `Marketing funnel "${funnelForm.name}" updated successfully!`);
      } else {
        toast.error('Failed to update funnel');
      }
    } catch (error) {
      console.error('Error updating funnel:', error);
      toast.error('Error updating funnel');
    } finally {
      setCreatingFunnel(false);
    }
  };

  const createNotification = async (type: string, message: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message })
      });
      
      // Reload notifications
      const nRes = await fetch('/api/notifications');
      const notificationsData = nRes.ok ? await nRes.json() : [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      // Reload notifications
      const nRes = await fetch('/api/notifications');
      const notificationsData = nRes.ok ? await nRes.json() : [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <DashboardLayout>
             <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
         <div>
           <h1 className="text-3xl font-extrabold text-white mb-1">Sales & Earnings</h1>
           <p className="text-sm text-gray-400">Manage your listed sites, view earnings and request payouts.</p>
         </div>
         
         {/* Notification Bell */}
         <div className="relative" ref={notificationRef}>
           <button
             onClick={() => setShowNotifications(!showNotifications)}
             className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors relative"
           >
             <BellIcon className="h-6 w-6 text-white" />
             {notifications.filter(n => !n.read).length > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                 {notifications.filter(n => !n.read).length}
               </span>
             )}
           </button>
           
           {/* Notifications Dropdown */}
           {showNotifications && (
             <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
               <div className="p-4 border-b border-gray-700">
                 <h3 className="text-white font-semibold">Notifications</h3>
               </div>
               {notifications.length === 0 ? (
                 <div className="p-4 text-gray-400 text-center">No notifications</div>
               ) : (
                 <div className="divide-y divide-gray-700">
                   {notifications.map((notification) => (
                     <div
                       key={notification.id}
                       className={`p-4 hover:bg-gray-700 cursor-pointer ${
                         !notification.read ? 'bg-blue-900/20' : ''
                       }`}
                       onClick={() => markNotificationAsRead(notification.id)}
                     >
                       <div className="text-white text-sm">{notification.message}</div>
                       <div className="text-gray-400 text-xs mt-1">
                         {new Date(notification.createdAt).toLocaleDateString()}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               {notifications.length > 0 && (
                 <div className="p-3 border-t border-gray-700">
                   <button
                     onClick={() => {
                       // Mark all as read
                       fetch('/api/notifications', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ all: true })
                       }).then(() => {
                         setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                       });
                     }}
                     className="text-blue-400 hover:text-blue-300 text-sm"
                   >
                     Mark all as read
                   </button>
                 </div>
               )}
             </div>
           )}
         </div>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl border border-gray-800 bg-black/40 p-6">
          <div className="text-gray-400 text-sm">Total Earnings</div>
          <div className="text-3xl font-bold text-white mt-1">₹{earnings.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-black/40 p-6 md:col-span-2">
          <div className="text-gray-200 font-medium mb-2">Withdraw</div>
          <div className="flex gap-2">
            <input type="number" value={payoutAmount} onChange={e=>setPayoutAmount(e.target.value)} placeholder="Amount (INR)" className="flex-1 rounded border px-3 py-2 bg-black text-white border-gray-800" />
                         <button className="px-4 py-2 rounded bg-purple-600 text-white font-semibold" onClick={async ()=>{
               const amt = parseFloat(payoutAmount);
               if (!amt || amt<=0) return;
               const res = await fetch('/api/users/payouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amt }) });
               if (res.ok) { 
                 setPayoutAmount(''); 
                 toast.success('Payout requested successfully!');
                 await createNotification('payout_requested', `Payout request of ₹${amt} submitted successfully!`);
               } else {
                 toast.error('Failed to request payout');
               }
             }}>Request Payout</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-black/40 p-6">
        <div className="text-white font-semibold mb-4">Your Listings</div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-gray-400">No listings yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((s) => {
              const connectedFunnel = getConnectedFunnel(s.templateId);
              return (
                <div key={s.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <div className="text-white font-semibold mb-2">{s.site?.name || 'Site'}</div>
                  <div className="text-gray-400 text-sm mb-1">Price: ₹{s.price}</div>
                  <div className="text-gray-400 text-sm mb-3">Sales: {s.totalSales || 0} • Earnings: ₹{(s.totalEarnings || 0).toFixed(2)}</div>
                  
                  {/* Funnel Status */}
                  {connectedFunnel ? (
                    <div className="mb-3 p-2 bg-green-900/20 border border-green-700 rounded">
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <RocketLaunchIcon className="h-4 w-4" />
                        <span>Marketing Funnel Active</span>
                      </div>
                                             <div className="text-xs text-green-300 mt-1">
                         Visits: {connectedFunnel.totalVisits || 0} • Conversions: {connectedFunnel.conversions || 0}
                       </div>
                    </div>
                  ) : (
                    <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
                      <div className="text-yellow-400 text-sm">No marketing funnel</div>
                      <div className="text-xs text-yellow-300">Create one to boost sales</div>
                    </div>
                  )}
                  
                                     <div className="flex flex-wrap gap-2">
                     {connectedFunnel ? (
                       <>
                         <Link 
                           href={`/f/${connectedFunnel.slug}`} 
                           target="_blank"
                           className="px-3 py-1 rounded bg-green-600 text-white text-sm flex items-center gap-1 hover:bg-green-700 transition-colors whitespace-nowrap"
                         >
                           <EyeIcon className="h-3 w-3" />
                           View Funnel
                         </Link>
                         <button
                           onClick={() => {
                             const url = `${window.location.origin}/f/${connectedFunnel.slug}`;
                             navigator.clipboard.writeText(url);
                             toast.success('Funnel URL copied to clipboard!');
                           }}
                           className="px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors whitespace-nowrap"
                         >
                           📋 Copy URL
                         </button>
                         <button 
                           onClick={() => openEditFunnelModal(connectedFunnel)}
                           className="px-3 py-1 rounded bg-blue-600 text-white text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors whitespace-nowrap"
                         >
                           <PencilIcon className="h-3 w-3" />
                           Edit Funnel
                         </button>
                         <button 
                           onClick={() => {
                             setFunnelToDelete(connectedFunnel);
                             setDeleteConfirmModal(true);
                           }}
                           className="px-3 py-1 rounded bg-red-600 text-white text-sm flex items-center gap-1 hover:bg-red-700 transition-colors whitespace-nowrap"
                         >
                           🗑️ Delete
                         </button>
                       </>
                     ) : (
                                             <button 
                        onClick={() => openCreateFunnelModal(s)}
                        className="px-3 py-1 rounded bg-purple-600 text-white text-sm flex items-center gap-1 hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        <RocketLaunchIcon className="h-3 w-3" />
                        Create Funnel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

             {/* Create Funnel Modal */}
       {createFunnelModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
             <h3 className="text-xl font-semibold text-white mb-4">
               Create Marketing Funnel
             </h3>
            
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Left Column - Form */}
               <div className="space-y-4">
                                   <div>
                    <label className="block text-sm text-gray-300 mb-1">Select Template *</label>
                    <select
                      value={selectedTemplate?.id || ''}
                      onChange={(e) => {
                        const template = getTemplatesOnSale().find(t => t.id === e.target.value);
                        if (template) {
                          setSelectedTemplate(template);
                          setFunnelForm(prev => ({
                            ...prev,
                            name: template.name + ' Marketing Funnel',
                            slug: template.name.toLowerCase().replace(/\s+/g, '-') + '-funnel'
                          }));
                        }
                      }}
                      className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                    >
                      <option value="">Choose a template to sell</option>
                      {getTemplatesOnSale().map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - ₹{template.price}
                        </option>
                      ))}
                    </select>
                  </div>
                 
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Funnel Name</label>
                   <input
                     type="text"
                     value={funnelForm.name}
                     onChange={(e) => setFunnelForm(prev => ({ ...prev, name: e.target.value }))}
                     className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                     placeholder="Enter funnel name"
                   />
                 </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={funnelForm.slug}
                    onChange={(e) => setFunnelForm(prev => ({ ...prev, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                    className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                    placeholder="funnel-url"
                  />
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-400 text-sm mb-2">
                    <strong>Note:</strong> This funnel will use our pre-designed, professional landing page template.
                  </div>
                  <div className="text-blue-300 text-xs">
                    The page will automatically showcase your template with modern design, features list, and secure payment integration.
                  </div>
                </div>
              </div>
              
                             {/* Right Column - Template Preview */}
               <div className="space-y-4">
                 <div className="text-white font-semibold mb-2">Template Preview</div>
                 {selectedTemplate ? (
                   <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                     <div className="text-white font-medium mb-2">{selectedTemplate.name}</div>
                     <div className="text-gray-400 text-sm mb-2">Price: ₹{selectedTemplate.price}</div>
                     <div className="text-gray-400 text-sm mb-3">Template Type: {selectedTemplate.site?.template}</div>
                  
                  {/* Template Preview */}
                  <div className="bg-white rounded p-3 mb-3">
                    <div className="text-gray-800 text-sm">
                      <div className="font-medium mb-2">Template Preview:</div>
                      <div className="bg-gray-100 p-2 rounded text-xs">
                        This template will be displayed to customers when they visit your funnel.
                      </div>
                    </div>
                  </div>
                  
                                       {/* Funnel URL Preview */}
                     <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                       <span className="text-gray-400">Funnel URL:</span> {window.location.origin}/f/{funnelForm.slug}
                     </div>
                   </div>
                 ) : (
                   <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                     <div className="text-gray-400 text-sm">Please select a template to see preview</div>
                   </div>
                 )}
                 
                                   {/* Template Info */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-300 text-sm">
                      <div className="font-medium mb-2">Template Details:</div>
                      <div className="space-y-1 text-xs">
                        <div>• Professional landing page design</div>
                        <div>• Mobile-responsive layout</div>
                        <div>• Integrated payment system</div>
                        <div>• Trust indicators & social proof</div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setCreateFunnelModal(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                disabled={creatingFunnel}
              >
                Cancel
              </button>
                             <button
                 onClick={handleCreateFunnel}
                 disabled={creatingFunnel || !selectedTemplate || !funnelForm.name || !funnelForm.slug}
                 className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
               >
                 {creatingFunnel ? 'Creating...' : 'Create Funnel'}
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
                     value={funnelForm.name}
                     onChange={(e) => setFunnelForm(prev => ({ ...prev, name: e.target.value }))}
                     className="w-full rounded border px-3 py-2 bg-gray-700 text-white border-gray-600"
                     placeholder="Enter funnel name"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">URL Slug</label>
                   <input
                     type="text"
                     value={funnelForm.slug}
                     onChange={(e) => setFunnelForm(prev => ({ ...prev, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
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
                     <span className="text-gray-400">Funnel URL:</span> {window.location.origin}/f/{funnelForm.slug}
                   </div>
                   
                                       {/* Stats */}
                    <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700 rounded">
                      <div className="text-blue-400 text-xs">
                        Visits: {funnelToEdit.totalVisits || 0} • Conversions: {funnelToEdit.conversions || 0}
                      </div>
                    </div>
                 </div>
                 
                                   {/* Template Info */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-300 text-sm">
                      <div className="font-medium mb-2">Template Details:</div>
                      <div className="space-y-1 text-xs">
                        <div>• Professional landing page design</div>
                        <div>• Mobile-responsive layout</div>
                        <div>• Integrated payment system</div>
                        <div>• Trust indicators & social proof</div>
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
                 disabled={creatingFunnel}
               >
                 Cancel
               </button>
               <button
                 onClick={handleUpdateFunnel}
                 disabled={creatingFunnel || !funnelForm.name || !funnelForm.slug}
                 className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
               >
                 {creatingFunnel ? 'Updating...' : 'Update Funnel'}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {deleteConfirmModal && funnelToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
             <h3 className="text-xl font-semibold text-white mb-4">
               Delete Funnel
             </h3>
             <p className="text-gray-300 mb-6">
               Are you sure you want to delete the funnel "{funnelToDelete.name}"? This action cannot be undone.
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
     </DashboardLayout>
   );
 }


