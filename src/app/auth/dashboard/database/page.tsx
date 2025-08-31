'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { gsap } from 'gsap';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Site {
  id: string;
  name: string;
  domain: string;
  type: string;
}

interface DatabaseEntry {
  id: string;
  tableName: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: DatabaseEntry | null;
  tableName: string;
  onSave: (data: any) => void;
  mode: 'create' | 'edit';
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({ 
  isOpen, 
  onClose, 
  entry, 
  tableName, 
  onSave, 
  mode 
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (entry && mode === 'edit') {
      setFormData(entry.data);
    } else {
      setFormData({});
    }
  }, [entry, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Entry' : 'Edit Entry'} - {tableName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tableName === 'projects' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                <input
                  type="text"
                  value={formData.technologies || ''}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {tableName === 'products' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {tableName === 'blog_posts' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="web design, development, tips"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DatabaseManager() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('projects');
  const [entries, setEntries] = useState<DatabaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DatabaseEntry | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const tableOptions = [
    { value: 'projects', label: 'Projects', icon: '🚀' },
    { value: 'products', label: 'Products', icon: '🛍️' },
    { value: 'blog_posts', label: 'Blog Posts', icon: '📝' },
    { value: 'testimonials', label: 'Testimonials', icon: '💬' },
    { value: 'team_members', label: 'Team Members', icon: '👥' }
  ];

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchEntries();
    }
  }, [selectedSite, selectedTable]);

  useEffect(() => {
    if (sites.length > 0) {
      animatePageLoad();
    }
  }, [sites]);

  const animatePageLoad = () => {
    gsap.fromTo(heroRef.current, 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
    
    gsap.fromTo(statsRef.current, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
    );
    
    gsap.fromTo(tableRef.current, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power3.out' }
    );
  };

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites/my-sites');
      if (response.ok) {
        const sitesData = await response.json();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!selectedSite) return;
    
    try {
      const response = await fetch(`/api/database/${selectedSite}/entries?table=${selectedTable}`);
      if (response.ok) {
        const entriesData = await response.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const createEntry = async (data: any) => {
    if (!selectedSite) return;
    
    try {
      const response = await fetch(`/api/database/${selectedSite}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: selectedTable,
          data: data
        })
      });
      
      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const updateEntry = async (entryId: string, data: any) => {
    if (!selectedSite) return;
    
    try {
      const response = await fetch(`/api/database/${selectedSite}/entries/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: selectedTable,
          data: data
        })
      });
      
      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!selectedSite) return;
    
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch(`/api/database/${selectedSite}/entries/${entryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingEntry(null);
    setShowCreateModal(true);
  };

  const handleEdit = (entry: DatabaseEntry) => {
    setModalMode('edit');
    setEditingEntry(entry);
    setShowCreateModal(true);
  };

  const handleSave = (data: any) => {
    if (modalMode === 'create') {
      createEntry(data);
    } else if (editingEntry) {
      updateEntry(editingEntry.id, data);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const dataString = JSON.stringify(entry.data).toLowerCase();
    return dataString.includes(searchLower);
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div ref={heroRef} className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Manager</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Manage your site's data with powerful CRUD operations. Create, read, update, and delete entries across different tables and databases.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlusCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Entries</p>
                    <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FunnelIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Tables</p>
                    <p className="text-2xl font-bold text-green-900">{tableOptions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <EyeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Selected Site</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {sites.find(s => s.id === selectedSite)?.name || 'None'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <PencilIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Current Table</p>
                    <p className="text-lg font-semibold text-orange-900">
                      {tableOptions.find(t => t.value === selectedTable)?.label || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div ref={tableRef} className="max-w-7xl mx-auto px-6 py-8">
          {/* Controls and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Site Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.domain})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Table Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tableOptions.map((table) => (
                      <option key={table.value} value={table.value}>
                        {table.icon} {table.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search and Create */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                  />
                </div>
                
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Entry</span>
                </button>
              </div>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {tableOptions.find(t => t.value === selectedTable)?.label} Entries
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <PlusCircleIcon className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">No entries found</p>
                          <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first entry.'}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleCreate}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Create First Entry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {renderEntryData(entry.data, selectedTable)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <CreateEditModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          entry={editingEntry}
          tableName={selectedTable}
          onSave={handleSave}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
}

function renderEntryData(data: any, tableName: string) {
  switch (tableName) {
    case 'projects':
      return (
        <div>
          <div className="font-medium text-gray-900">{data.name || 'Untitled Project'}</div>
          <div className="text-gray-600 text-sm">{data.description || 'No description'}</div>
          {data.technologies && (
            <div className="text-xs text-blue-600 mt-1">{data.technologies}</div>
          )}
        </div>
      );
    
    case 'products':
      return (
        <div>
          <div className="font-medium text-gray-900">{data.name || 'Untitled Product'}</div>
          <div className="text-gray-600 text-sm">{data.description || 'No description'}</div>
          {data.price && (
            <div className="text-sm font-medium text-green-600 mt-1">₹{data.price}</div>
          )}
        </div>
      );
    
    case 'blog_posts':
      return (
        <div>
          <div className="font-medium text-gray-900">{data.title || 'Untitled Post'}</div>
          <div className="text-gray-600 text-sm line-clamp-2">
            {data.content || 'No content'}
          </div>
        </div>
      );
    
    default:
      return (
        <div className="text-sm text-gray-600">
          {JSON.stringify(data, null, 2)}
        </div>
      );
  }
}
