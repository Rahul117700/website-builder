import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import dynamic from 'next/dynamic';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TemplateAdminPanelProps {
  heading?: string;
  description?: string;
  search?: string;
  setSearch?: (v: string) => void;
  page?: number;
  setPage?: (v: number) => void;
  templatesPerPage?: number;
}

// Add types for page code and form
interface PageCode {
  html: string;
  css: string;
  js: string;
}
interface TemplateForm {
  name: string;
  category: string;
  price: number;
  description: string;
  preview: string;
  pages: { [key: string]: PageCode };
}

// Helper to extract code blocks from markdown or plain text
function extractCodeBlocks(aiCode: any) {
  let html = '', css = '', js = '';
  if (typeof aiCode === 'object' && aiCode !== null) {
    html = aiCode.html || '';
    css = aiCode.css || '';
    js = aiCode.js || '';
  } else if (typeof aiCode === 'string') {
    // Try to extract ```html, ```css, ```js blocks
    const htmlMatch = aiCode.match(/```html[\r\n]+([\s\S]*?)```/i);
    const cssMatch = aiCode.match(/```css[\r\n]+([\s\S]*?)```/i);
    const jsMatch = aiCode.match(/```js[\r\n]+([\s\S]*?)```/i) || aiCode.match(/```javascript[\r\n]+([\s\S]*?)```/i);
    html = htmlMatch ? htmlMatch[1].trim() : '';
    css = cssMatch ? cssMatch[1].trim() : '';
    js = jsMatch ? jsMatch[1].trim() : '';
    // If no blocks, treat the whole string as HTML
    if (!html && !css && !js) html = aiCode.trim();
  }
  return { html, css, js };
}

export default function TemplateAdminPanel({ heading = 'Template Management', description = 'Create, edit, approve, and delete templates for the marketplace.', search = '', setSearch, page = 1, setPage, templatesPerPage = 10 }: TemplateAdminPanelProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const requiredPages = ['home', 'about', 'contact', 'services', 'product'];
  const emptyPage = { html: '', css: '', js: '' };
  const [form, setForm] = useState<TemplateForm>({
    name: '',
    category: '',
    price: 0,
    description: '',
    preview: '',
    pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {})
  });
  const [editing, setEditing] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedTab, setSelectedTab] = useState<'html'|'css'|'js'>('html');
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCode, setAiCode] = useState<any>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/templates');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTemplates(); }, []);

  // Handle form submit (create or update)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = '/api/admin/templates';
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editing ? 'Template updated!' : 'Template created!');
        setForm({
          name: '',
          category: '',
          price: 0,
          description: '',
          preview: '',
          pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {})
        });
        setEditing(null);
        fetchTemplates();
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(err.error || 'Error');
      }
    } catch (error) {
      console.error('Error submitting template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  // Approve template
  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/templates/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id }),
      });
      if (res.ok) {
        toast.success('Template approved!');
        fetchTemplates();
      } else {
        toast.error('Error approving template');
      }
    } catch (error) {
      console.error('Error approving template:', error);
      toast.error('Failed to approve template');
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Template deleted!');
        fetchTemplates();
      } else {
        toast.error('Error deleting template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  // Edit template
  const handleEdit = (tpl: any) => {
    setEditing(tpl);
    // If tpl.pages exists, use it. Otherwise, map old fields to 'home' page for backward compatibility
    setForm({
      name: tpl.name || '',
      category: tpl.category || '',
      price: tpl.price || 0,
      description: tpl.description || '',
      preview: tpl.preview || '',
      pages: tpl.pages || requiredPages.reduce((acc, page) => ({ ...acc, [page]: page === 'home' ? { html: tpl.html || '', css: tpl.css || '', js: tpl.js || '' } : { ...emptyPage } }), {} as { [key: string]: PageCode })
    });
  };

  // Filter and paginate templates
  const filteredTemplates = templates.filter(tpl =>
    tpl.name.toLowerCase().includes((search || '').toLowerCase()) ||
    (tpl.category || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (tpl.section || '').toLowerCase().includes((search || '').toLowerCase())
  );
  const pageCount = Math.ceil(filteredTemplates.length / templatesPerPage);
  const paginatedTemplates = filteredTemplates.slice((page-1)*templatesPerPage, page*templatesPerPage);

  // Live preview document
  const pageObj = form.pages?.[selectedPage] || { html: '', css: '', js: '' };
  const previewDoc = `<!DOCTYPE html><html><head><style>${pageObj.css}</style></head><body>${pageObj.html}<script>${pageObj.js}</script></body></html>`;

  // AI Code Assistant logic
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiCode('');
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, mode: 'code' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiCode(data.code || data);
      } else {
        setAiCode('');
        toast.error('Failed to generate code');
      }
    } catch {
      setAiCode('');
      toast.error('Failed to generate code');
    }
    setAiLoading(false);
  };
  const handleCopyAICode = () => {
    if (!aiCode) return;
    let text = '';
    if (typeof aiCode === 'object') {
      text = `${aiCode.html || ''}\n${aiCode.css || ''}\n${aiCode.js || ''}`;
    } else {
      text = aiCode;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const codeBlocks = extractCodeBlocks(aiCode);

  // Extract unique categories from templates
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border-2 border-yellow-300 shadow-xl rounded-2xl p-8 mb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-black mb-1">{heading}</h1>
        <p className="text-base text-black opacity-80">{description}</p>
      </div>
      {/* AI Code Assistant */}
      <div className="w-full bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 border border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center mb-2">
          <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
          <span className="font-bold text-lg text-purple-700">AI Code Assistant</span>
        </div>
        <p className="text-gray-600 mb-3 text-sm">Describe what you want to build and get instant code suggestions powered by AI.</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="e.g. Create a responsive navbar in React"
            rows={2}
            className="flex-1 border border-purple-200 rounded-lg p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none transition"
            style={{ minHeight: 44 }}
          />
          <button
            onClick={handleAIGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
            className="h-11 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-60 mt-2 sm:mt-0"
          >
            {aiLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
        {aiCode && (
          <div className="mt-4 bg-white border border-green-200 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap relative shadow-sm">
            {/* HTML Block */}
            <div className="mb-4">
              <span className="font-bold text-purple-700 mr-2">HTML:</span>
              <button
                onClick={() => { setForm(f => ({ ...f, pages: { ...f.pages, [selectedPage]: { ...f.pages[selectedPage], html: codeBlocks.html } } })); toast.success('HTML code applied!'); }}
                className="ml-2 px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
              >
                Insert to HTML
              </button>
              <pre className="bg-gray-50 border rounded p-2 mt-2 overflow-x-auto text-black text-xs" style={{minHeight: 40}}>{codeBlocks.html}</pre>
            </div>
            {/* CSS Block */}
            <div className="mb-4">
              <span className="font-bold text-blue-700 mr-2">CSS:</span>
              <button
                onClick={() => { setForm(f => ({ ...f, pages: { ...f.pages, [selectedPage]: { ...f.pages[selectedPage], css: codeBlocks.css } } })); toast.success('CSS code applied!'); }}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
              >
                Insert to CSS
              </button>
              <pre className="bg-gray-50 border rounded p-2 mt-2 overflow-x-auto text-black text-xs" style={{minHeight: 40}}>{codeBlocks.css}</pre>
            </div>
            {/* JavaScript Block */}
            <div className="mb-4">
              <span className="font-bold text-green-700 mr-2">JavaScript:</span>
              <button
                onClick={() => { setForm(f => ({ ...f, pages: { ...f.pages, [selectedPage]: { ...f.pages[selectedPage], js: codeBlocks.js } } })); toast.success('JavaScript code applied!'); }}
                className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition"
              >
                Insert to JavaScript
              </button>
              <pre className="bg-gray-50 border rounded p-2 mt-2 overflow-x-auto text-black text-xs" style={{minHeight: 40}}>{codeBlocks.js}</pre>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleCopyAICode}
                className="px-3 py-1 bg-gray-500 text-white rounded text-xs flex items-center gap-1 hover:bg-gray-700 transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-black">Name</label>
              <input className="input-field w-full text-black bg-white border border-gray-300 rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="font-semibold text-black">Category</label>
              <Autocomplete
                freeSolo
                options={categories}
                value={form.category}
                onInputChange={(_, value) => setForm(f => ({ ...f, category: value }))}
                renderInput={(params) => (
                  <TextField {...params} className="input-field w-full" placeholder="Category" />
                )}
              />
            </div>
            <div>
              <label className="font-semibold text-black">Price (INR)</label>
              <input type="number" className="input-field w-full text-black bg-white border border-gray-300 rounded px-3 py-2" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} min={0} required />
            </div>
            <div>
              <label className="font-semibold text-black">Preview Image</label>
              <input
                type="file"
                accept="image/*"
                className="input-field w-full text-black bg-white border border-gray-300 rounded px-3 py-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('image', file);
                  const res = await fetch('/api/templates/upload-image', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await res.json();
                  if (data.url) {
                    setForm(f => { 
                      const updated = { ...f, preview: data.url };
                      console.log('Preview image URL set to:', updated.preview); // Debug log
                      return updated;
                    });
                  } else {
                    alert('Image upload failed');
                  }
                }}
              />
              {form.preview && (
                <img src={form.preview} alt="Preview" className="mt-2 rounded border max-h-32" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold text-black">Description</label>
              <textarea className="input-field w-full text-black bg-white border border-gray-300 rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          {/* Tabbed Monaco Editor for HTML/CSS/JS */}
          <div className="w-full">
            <div className="mb-2 flex gap-2 items-center flex-wrap text-black">
              {requiredPages.map(page => (
                <button type="button" key={page} className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedPage===page ? 'border-yellow-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedPage(page)}>{page.charAt(0).toUpperCase()+page.slice(1)}</button>
              ))}
              <span className="mx-2">|</span>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='html' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('html')}>HTML</button>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='css' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('css')}>CSS</button>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='js' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('js')}>JavaScript</button>
              <button type="button" className="ml-auto px-4 py-2 rounded bg-yellow-100 text-yellow-800 font-bold hover:bg-yellow-200 transition" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Hide Preview' : 'Show Preview'}</button>
            </div>
            <div className="w-full h-80 sm:h-96 mb-4 max-w-full">
              <MonacoEditor
                height="100%"
                defaultLanguage={selectedTab}
                language={selectedTab}
                value={(form.pages?.[selectedPage]?.[selectedTab]) ?? ''}
                onChange={value => setForm(f => ({ ...f, pages: { ...f.pages, [selectedPage]: { ...f.pages[selectedPage], [selectedTab]: value || '' } } }))}
                theme="vs"
                options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: 'on' }}
              />
            </div>
            {showPreview && (
              <div className="w-full border rounded bg-gray-50 my-4" style={{ minHeight: 300 }}>
                <iframe
                  title="Live Preview"
                  srcDoc={previewDoc}
                  style={{ width: '100%', height: 400, border: 'none', background: 'white' }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
            {/* Optionally, add a live preview for the selected page */}
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn-primary px-5 py-2 rounded bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition" disabled={loading}>{editing ? 'Update' : 'Create'} Template</button>
            {editing && <button type="button" className="btn-secondary px-5 py-2 rounded bg-gray-200 text-black font-bold shadow hover:bg-gray-300 transition" onClick={() => { setEditing(null); setForm({ name: '', category: '', price: 0, description: '', preview: '', pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {}) }); }}>Cancel</button>}
          </div>
        </form>
      </div>
      {/* Table Section */}
      <div className="w-full bg-white p-6 rounded-xl shadow border border-gray-200 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">All Templates</h2>
            {setSearch && (
              <input
                type="text"
                placeholder="Search templates..."
                className="border rounded px-3 py-2 text-black bg-white focus:ring-2 focus:ring-yellow-400"
                value={search}
                onChange={e => { setSearch(e.target.value); if (setPage) setPage(1); }}
                style={{ minWidth: 200 }}
              />
            )}
          </div>
          {loading ? <div className="text-black">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="p-2 text-left text-black">Name</th>
                    <th className="p-2 text-left text-black">Category</th>
                    <th className="p-2 text-left text-black">Price</th>
                    <th className="p-2 text-left text-black">Status</th>
                    <th className="p-2 text-left text-black">Created By</th>
                    <th className="p-2 text-left text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTemplates.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-gray-700">No templates found.</td></tr>
                  ) : paginatedTemplates.map(tpl => (
                    <tr key={tpl.id} className="border-b border-gray-100 hover:bg-yellow-50 transition group">
                      <td className="p-2 font-bold text-black">{tpl.name}</td>
                      <td className="p-2 text-black">{tpl.category}</td>
                      <td className="p-2 text-black">₹{tpl.price}</td>
                      <td className="p-2">
                        {tpl.approved ? <span className="inline-flex items-center gap-1 text-green-700 font-bold"><CheckCircleIcon fontSize="small" /> Approved</span> : <span className="text-yellow-700 font-bold">Pending</span>}
                      </td>
                      <td className="p-2 text-black">{tpl.createdBy}</td>
                      <td className="p-2 flex gap-2">
                        <button className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold hover:bg-blue-200 transition flex items-center gap-1" onClick={() => handleEdit(tpl)} title="Edit"><EditIcon fontSize="small" /></button>
                        {!tpl.approved && <button className="px-2 py-1 rounded bg-green-100 text-green-800 font-bold hover:bg-green-200 transition flex items-center gap-1" onClick={() => handleApprove(tpl.id)} title="Approve"><CheckCircleIcon fontSize="small" /></button>}
                        <button className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold hover:bg-red-200 transition flex items-center gap-1" onClick={() => handleDelete(tpl.id)} title="Delete"><DeleteIcon fontSize="small" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pageCount > 1 && setPage && (
            <div className="flex justify-center mt-4">
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </div>
          )}
        </div>
    </div>
  );
} 