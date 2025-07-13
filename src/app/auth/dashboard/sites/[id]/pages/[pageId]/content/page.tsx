"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';
import { CodeBracketIcon, SparklesIcon, ClipboardIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Sandpack } from '@codesandbox/sandpack-react';
import AddPageModal from '@/components/dashboard/add-page-modal';
import EditPageModal from '@/components/dashboard/edit-page-modal';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

// Dynamically import MonacoEditor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type AICodeType = string | { html: string; css: string; js: string };

export default function ManageContentPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const pageId = params?.pageId as string;
  const [mode, setMode] = useState<'template'|'code'|'jsx'|null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'html'|'css'|'js'>('html');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [siteSubdomain, setSiteSubdomain] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'html'|'react'>('html');
  const [currentRenderMode, setCurrentRenderMode] = useState<'html'|'react'>('html');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCode, setAiCode] = useState<AICodeType>('');
  const [aiLoading, setAiLoading] = useState(false);
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [publishedPages, setPublishedPages] = useState<any[]>([]);
  const router = useRouter();
  const [allPages, setAllPages] = useState<any[]>([]); // all pages, not just published
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [editPageOpen, setEditPageOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<any>(null);

  // Default starter code for React (JSX) mode
  const defaultJsxCode = `<div style={{ padding: 32, textAlign: 'center' }}>
  <h1 style={{ color: '#7c3aed', fontWeight: 800, fontSize: 32 }}>Welcome to the React (JSX) Editor!</h1>
  <p style={{ color: '#374151', fontSize: 18 }}>Edit the code and see your component update live below.</p>
</div>`;
  const [jsxCode, setJsxCode] = useState<string>(defaultJsxCode);

  // Default files for Sandpack
  const defaultFiles = {
    "/App.js": `import React from 'react';\nimport Component1 from './Component1';\nimport './styles.css';\n\nexport default function App() {\n  return (\n    <div className=\"app-container\">\n      <h1>Hello from App.js!</h1>\n      <Component1 />\n    </div>\n  );\n}`,
    "/Component1.js": `import React from 'react';\nexport default function Component1() {\n  return <div className=\"component1\">This is Component1.js</div>;\n}`,
    "/styles.css": `.app-container { padding: 32px; background: #f0f4ff; }\n.component1 { color: #7c3aed; font-weight: bold; }`
  };

  // Sandpack files state
  const [sandpackFiles, setSandpackFiles] = useState<{ [key: string]: string }>(defaultFiles);
  const [activeFile, setActiveFile] = useState<string>("/App.js");

  // Load files from backend on mode load
  useEffect(() => {
    if (mode === 'jsx') {
      setLoading(true);
      fetch(`/api/pages/${pageId}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.reactCode && typeof data.reactCode === 'object') {
            setSandpackFiles(data.reactCode);
            setActiveFile(Object.keys(data.reactCode)[0] || "/App.js");
          } else {
            setSandpackFiles(defaultFiles);
            setActiveFile("/App.js");
          }
          setRenderMode(data.renderMode || 'html');
          setCurrentRenderMode(data.renderMode || 'html');
          setLoading(false);
        })
        .catch(() => {
          setSandpackFiles(defaultFiles);
          setActiveFile("/App.js");
          setRenderMode('html');
          setCurrentRenderMode('html');
          setLoading(false);
        });
    }
  }, [mode, pageId]);

  // Add a new component file
  const handleAddComponent = () => {
    let idx = 2;
    while (sandpackFiles[`/Component${idx}.js`]) idx++;
    setSandpackFiles({
      ...sandpackFiles,
      [`/Component${idx}.js`]: `import React from 'react';\nexport default function Component${idx}() {\n  return <div className=\"component${idx}\">This is Component${idx}.js</div>;\n}`
    });
    setActiveFile(`/Component${idx}.js`);
  };

  // Remove a component file
  const handleRemoveComponent = (file: string) => {
    if (file === "/App.js" || file === "/styles.css") return;
    const newFiles = { ...sandpackFiles };
    delete newFiles[file];
    setSandpackFiles(newFiles);
    setActiveFile("/App.js");
  };

  // Update file content
  const handleFileChange = (file: string, code: string) => {
    setSandpackFiles(prev => ({ ...prev, [file]: code }));
  };

  // Handler for publishing JSX code (send all files)
  const handlePublishJsx = async () => {
    setLoading(true);
    const toastId = toast.loading('Publishing...');
    try {
      const newRenderMode = 'react';
      console.log('Publishing React files:', sandpackFiles); // Debug log
      const res = await fetch(`/api/pages/${pageId}/save-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactCode: sandpackFiles, renderMode: newRenderMode }),
      });
      if (res.ok) {
        toast.success('React (JSX) is now live!', { id: toastId });
        setCurrentRenderMode(newRenderMode);
        setRenderMode(newRenderMode);
      } else {
        toast.error('Failed to publish', { id: toastId });
      }
    } catch (e) {
      toast.error('Failed to publish', { id: toastId });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mode === 'template') {
      setLoading(true);
      fetch('/api/templates')
        .then(res => res.json())
        .then(setTemplates)
        .catch(() => setError('Failed to load templates'));
      fetch('/api/templates/purchased')
        .then(res => res.json())
        .then(setPurchased)
        .catch(() => setError('Failed to load purchased templates'));
      setLoading(false);
    }
    if (mode === 'code') {
      setLoading(true);
      fetch(`/api/pages/${pageId}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          setHtmlCode(data.htmlCode || '');
          setCssCode(data.cssCode || '');
          setJsCode(data.jsCode || '');
          setRenderMode(data.renderMode || 'html');
          setCurrentRenderMode(data.renderMode || 'html');
          setLoading(false);
        })
        .catch(() => {
          setHtmlCode('');
          setCssCode('');
          setJsCode('');
          setRenderMode('html');
          setCurrentRenderMode('html');
          setLoading(false);
        });
    }
    if (mode === 'jsx') {
      setLoading(true);
      fetch(`/api/pages/${pageId}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          setJsxCode(data.reactCode || defaultJsxCode);
          setRenderMode(data.renderMode || 'html');
          setCurrentRenderMode(data.renderMode || 'html');
          setLoading(false);
        })
        .catch(() => {
          setJsxCode(defaultJsxCode);
          setRenderMode('html');
          setCurrentRenderMode('html');
      setLoading(false);
        });
    }
    // Fetch site subdomain for Visit Site link
    if (siteId) {
      fetch(`/api/sites/${siteId}`)
        .then(res => res.json())
        .then(data => setSiteSubdomain(data.subdomain))
        .catch(() => setSiteSubdomain(null));
    }
  }, [mode, pageId, siteId]);

  // Fetch all published pages for the site
  useEffect(() => {
    if (siteId) {
      fetch(`/api/pages?siteId=${siteId}`)
        .then(res => res.json())
        .then(pages => setPublishedPages(pages.filter((p: any) => p.isPublished)))
        .catch(() => setPublishedPages([]));
    }
  }, [siteId]);

  // Fetch all pages for the site (not just published)
  useEffect(() => {
    if (siteId) {
      fetch(`/api/pages?siteId=${siteId}`)
        .then(res => res.json())
        .then(pages => {
          setAllPages(pages);
          setPublishedPages(pages.filter((p: any) => p.isPublished));
          const found = pages.find((p: any) => p.id === pageId);
          setCurrentPage(found || null);
        })
        .catch(() => {
          setAllPages([]);
          setPublishedPages([]);
          setCurrentPage(null);
        });
    }
  }, [siteId, pageId]);

  // Add new page handler
  const handleAddPage = async (data: { title: string; slug: string; content: string; isPublished: boolean }) => {
    if (!siteId) return;
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, siteId }),
    });
    if (res.ok) {
      const newPage = await res.json();
      toast.success('Page created!');
      setAddPageOpen(false);
      router.push(`/auth/dashboard/sites/${siteId}/pages/${newPage.id}/content`);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to create page');
    }
  };

  // Edit page handler (for publish/unpublish and edit)
  const handleEditPage = async (data: { id: string; title: string; slug: string; isPublished: boolean }) => {
    const res = await fetch(`/api/pages/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data }),
    });
    if (res.ok) {
      toast.success('Page updated!');
      setEditPageOpen(false);
      // Refresh page list and current page
      if (siteId) {
        fetch(`/api/pages?siteId=${siteId}`)
          .then(res => res.json())
          .then(pages => {
            setAllPages(pages);
            setPublishedPages(pages.filter((p: any) => p.isPublished));
            const found = pages.find((p: any) => p.id === pageId);
            setCurrentPage(found || null);
          });
      }
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to update page');
    }
  };

  // Publish/unpublish toggle
  const handleTogglePublish = async () => {
    if (!currentPage) return;
    await handleEditPage({
      id: currentPage.id,
      title: currentPage.title,
      slug: currentPage.slug,
      isPublished: !currentPage.isPublished,
    });
  };

  // Delete page handler
  const handleDeletePage = async () => {
    if (!currentPage) return;
    if (!window.confirm(`Are you sure you want to delete the page "${currentPage.title}"? This action cannot be undone.`)) return;
    const res = await fetch(`/api/pages/${currentPage.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast.success('Page deleted!');
      router.push(`/auth/dashboard/sites/${siteId}/pages`);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to delete page');
    }
  };

  useEffect(() => {
    // Reset aiCode to correct type when mode changes
    if (mode === 'jsx') setAiCode('');
    if (mode === 'code') setAiCode({ html: '', css: '', js: '' });
  }, [mode]);

  // Handler for purchasing a template
  const handlePurchase = async (templateId: string) => {
    setLoading(true);
    await fetch('/api/templates/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    });
    // Refresh purchased list
    fetch('/api/templates/purchased')
      .then(res => res.json())
      .then(setPurchased);
    setLoading(false);
  };

  // Handler for applying a template to the page
  const handleApplyTemplate = async (templateId: string) => {
    setLoading(true);
    await fetch(`/api/pages/${pageId}/apply-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    });
    setLoading(false);
  };

  // Handler for publishing all code files
  const handlePublishCode = async () => {
    setLoading(true);
    const toastId = toast.loading('Publishing...');
    try {
      const newRenderMode = 'html';
      const res = await fetch(`/api/pages/${pageId}/save-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlCode, cssCode, jsCode, renderMode: newRenderMode }),
      });
      if (res.ok) {
        toast.success('HTML/CSS/JS is now live!', { id: toastId });
        setCurrentRenderMode(newRenderMode);
        setRenderMode(newRenderMode);
      } else {
        toast.error('Failed to publish', { id: toastId });
      }
    } catch (e) {
      toast.error('Failed to publish', { id: toastId });
    }
    setLoading(false);
  };

  // Handler for live preview (combine all code)
  const handlePreview = () => {
    const doc = `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}</script></body></html>`;
    setPreview(doc);
  };

  // Handler for AI code generation (update system prompt for React mode)
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiCode('');
    try {
      let systemMessage = '';
      let currentCodePrompt = '';
      let publishedPagesPrompt = '';
      if (mode === 'code') {
        // Add current code if present
        if (htmlCode.trim()) currentCodePrompt += `\nCurrent HTML:\n<code>\n${htmlCode}\n</code>\n`;
        if (cssCode.trim()) currentCodePrompt += `\nCurrent CSS:\n<code>\n${cssCode}\n</code>\n`;
        if (jsCode.trim()) currentCodePrompt += `\nCurrent JavaScript:\n<code>\n${jsCode}\n</code>\n`;
        if (publishedPages.length > 0) {
          publishedPagesPrompt = `\nYou have these published pages: ${publishedPages.map(p => `${p.title} (slug: ${p.slug})`).join(', ')}. You can link to them using their slugs.`;
        }
        systemMessage = `You are a coding assistant for a website builder. When the user asks for a feature, return three separate code blocks: 1. HTML (inside <html>...</html>), 2. CSS (inside <style>...</style>), 3. JavaScript (inside <script>...</script>). Do not include explanations, only the code blocks.`;
      } else {
        systemMessage = `You are a coding assistant for a website builder. When the user asks for a feature, return a JSON object with keys as filenames (e.g., "/App.js", "/Component1.js", "/styles.css"). Each value should be the code for that file. The main file should be /App.js, and you can add additional components and styles as needed. Do not include explanations, only the JSON object.`;
      }
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt + (currentCodePrompt ? `\nThis is my current code:${currentCodePrompt}` : '') + publishedPagesPrompt, mode, systemMessage }),
      });
      const data = await res.json();
      if (mode === 'code') {
        // Parse HTML, CSS, JS blocks
        const htmlMatch = data.code.match(/<html[\s\S]*?<\/html>/i);
        const cssMatch = data.code.match(/<style[\s\S]*?<\/style>/i);
        const jsMatch = data.code.match(/<script[\s\S]*?<\/script>/i);
        setAiCode({
          html: htmlMatch ? htmlMatch[0].replace(/<\/?html>/gi, '').trim() : '',
          css: cssMatch ? cssMatch[0].replace(/<\/?style>/gi, '').trim() : '',
          js: jsMatch ? jsMatch[0].replace(/<\/?script>/gi, '').trim() : '',
        });
      } else {
        // Try to parse JSON for multi-file React code
        try {
          const filesObj = JSON.parse(data.code);
          setAiCode(filesObj);
        } catch {
          setAiCode(data.code || data.result || '');
        }
      }
    } catch (e) {
      setAiCode('Error generating code.');
    }
    setAiLoading(false);
  };

  const handleInsertAICode = () => {
    if (mode === 'jsx') setJsxCode(aiCode as string);
    else if (mode === 'code' && typeof aiCode === 'object' && aiCode !== null) {
      if (selectedTab === 'html') setHtmlCode((aiCode as any).html || '');
      else if (selectedTab === 'css') setCssCode((aiCode as any).css || '');
      else if (selectedTab === 'js') setJsCode((aiCode as any).js || '');
    }
  };

  const handleCopyAICode = () => {
    if (!aiCode) return;
    let codeToCopy = '';
    if (mode === 'jsx' && typeof aiCode === 'string') codeToCopy = aiCode;
    else if (mode === 'code' && typeof aiCode === 'object' && aiCode !== null) {
      if (selectedTab === 'html') codeToCopy = aiCode.html;
      else if (selectedTab === 'css') codeToCopy = aiCode.css;
      else if (selectedTab === 'js') codeToCopy = aiCode.js;
    }
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Handler to insert a link to a published page in the HTML editor
  const handleInsertPageLink = (page: any) => {
    const link = `<a href=\"/s/${siteSubdomain}?page=${page.slug}\">${page.title}</a>`;
    setHtmlCode(htmlCode + (htmlCode && !htmlCode.endsWith('\n') ? '\n' : '') + link);
    toast.success(`Link to '${page.title}' inserted!`);
  };

  // Device widths
  const deviceWidths = {
    desktop: '1440px',
    tablet: '768px',
    mobile: '375px',
  };

  // Automatically set mode to 'code' when pageId changes, unless user is explicitly choosing
  useEffect(() => {
    setMode('code');
  }, [pageId]);

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 mb-2 tracking-tight drop-shadow-lg">Manage Page Content</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-300 font-medium">
          Choose how you want to build this page.
        </p>
        {mode === 'code' && siteSubdomain && (
          <a
            href={`/s/${siteSubdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 underline text-base font-medium"
          >
            Visit Live Site ↗
          </a>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-3xl p-8 sm:p-10 mb-8 w-full border-2 border-purple-100">
        {!mode && (
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {/* Use Existing Template Card */}
            <button
              className="flex-1 group bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center transition-all duration-200 border-2 border-transparent hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setMode('template')}
              aria-label="Use Existing Template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-xl font-bold mb-1">Use Existing Template</span>
              <span className="text-base font-medium opacity-90">Start with a professionally designed template for fast results.</span>
            </button>
            {/* Code Your Page Card */}
            <button
              className="flex-1 group bg-gradient-to-br from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center transition-all duration-200 border-2 border-transparent hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => setMode('code')}
              aria-label="Code Your Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.88 3.549A9.953 9.953 0 0012 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-1.657-.403-3.22-1.12-4.551M8 12l2 2 4-4" />
              </svg>
              <span className="text-xl font-bold mb-1">Code Your Page (HTML/CSS/JS)</span>
              <span className="text-base font-medium opacity-90">Build your page from scratch using the Monaco code editor.</span>
            </button>
            {/* React (JSX) Editor Card */}
            {/**
            <button
              className="flex-1 group bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center transition-all duration-200 border-2 border-transparent hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              onClick={() => setMode('jsx')}
              aria-label="React (JSX) Editor"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h-1v-2a2 2 0 00-2-2h-1a2 2 0 00-2 2v2H7m6 0v-2a2 2 0 00-2-2h-1a2 2 0 00-2 2v2" />
              </svg>
              <span className="text-xl font-bold mb-1">React (JSX) Editor</span>
              <span className="text-base font-medium opacity-90">Write and preview React components live in the browser.</span>
            </button>
            **/}
          </div>
        )}
        {(mode === 'code' || mode === 'jsx') && (
          <div className="mb-6 flex flex-col items-start w-full">
          
            <label className="font-semibold text-black mb-2 flex items-center gap-3">
              Choose what to render on your live site:
              {currentRenderMode === 'html' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                  <CodeBracketIcon className="h-4 w-4" /> Current: HTML/CSS/JS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                  <SparklesIcon className="h-4 w-4" /> Current: React (JSX)
                </span>
              )}
            </label>
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-base font-semibold focus:outline-none ${renderMode === 'html' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-black border-gray-300 hover:bg-purple-50'}`}
                onClick={() => { setRenderMode('html'); setMode('code'); }}
                disabled={mode === 'code' && currentRenderMode === 'html'}
              >
                <CodeBracketIcon className="h-5 w-5" /> HTML/CSS/JS
              </button>
              {/* Render mode toggle for React (JSX) */}
              {/**
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-base font-semibold focus:outline-none ${renderMode === 'react' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-black border-gray-300 hover:bg-green-50'}`}
                onClick={() => { setRenderMode('react'); setMode('jsx'); }}
                disabled={mode === 'jsx' && currentRenderMode === 'react'}
              >
                <SparklesIcon className="h-5 w-5" /> React (JSX)
              </button>
              **/}
            </div>
          </div>
        )}
        {mode === 'template' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Templates</h2>
            {loading ? <div>Loading...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="border rounded-lg p-4 flex flex-col gap-2">
                    <div className="font-bold">{t.name}</div>
                    <div>Price: ₹{t.price}</div>
                    <button className="btn-primary" onClick={() => handlePurchase(t.id)}>Purchase</button>
                    <button className="btn-secondary" onClick={() => handleApplyTemplate(t.id)}>Apply to Page</button>
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-lg font-semibold mt-8 mb-4">My Purchased Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchased.map(t => (
                <div key={t.id} className="border rounded-lg p-4 flex flex-col gap-2">
                  <div className="font-bold">{t.name}</div>
                  <button className="btn-secondary" onClick={() => handleApplyTemplate(t.id)}>Apply to Page</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary mt-6" onClick={() => setMode(null)}>Back</button>
          </div>
        )}
        
        
        {mode === 'code' && (
          loading ? (
            <div className="flex justify-center items-center w-full h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-4 text-lg font-semibold text-purple-600">Loading editor...</span>
            </div>
          ) : (
          <div className="flex flex-col gap-6 w-full bg-white">
            
            {/* --- Top controls: all in a single row above AI Code Assistant --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 w-full">
              {/* Left: Page switcher, Add/Edit/Publish/Unpublish */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-black">Page:</span>
                <select
                  className="border rounded px-2 py-1 text-sm text-black bg-white"
                  value={pageId}
                  onChange={e => {
                    router.push(`/auth/dashboard/sites/${siteId}/pages/${e.target.value}/content`);
                  }}
                >
                  {allPages.map(page => (
                    <option key={page.id} value={page.id}>{page.title} {page.isPublished ? '' : '(Unpublished)'}</option>
                  ))}
                </select>
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition flex items-center gap-1"
                  onClick={() => setAddPageOpen(true)}
                >
                  <AddIcon fontSize="small" /> <PlusIcon className="h-4 w-4" /> Add New Page
                </button>
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition flex items-center gap-1"
                  onClick={() => setEditPageOpen(true)}
                  disabled={!currentPage}
                >
                  <EditIcon fontSize="small" /> Edit Page
                </button>
                {currentPage && (
                  <button
                    className={`px-3 py-1 rounded border font-semibold transition flex items-center gap-1 ${currentPage.isPublished ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100' : 'border-yellow-600 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                    onClick={handleTogglePublish}
                  >
                    {currentPage.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {currentPage && (
                  <button
                    className="px-3 py-1 rounded border border-red-500 bg-white text-red-600 font-semibold hover:bg-red-50 transition flex items-center gap-1"
                    onClick={handleDeletePage}
                  >
                    <DeleteIcon fontSize="small" /> Delete Page
                  </button>
                )}
              </div>
              {/* Center: Main action buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                <button className="px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition" onClick={handlePublishCode} disabled={loading}>
                  {loading ? 'Publishing...' : 'Save and Publish'}
                </button>
                <button className="px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition" onClick={() => setMode(null)}>
                  Back
                </button>
                <button className="px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition" onClick={() =>{ handlePreview();setShowPreview(v => !v);}}>
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                {siteSubdomain && (
                  <a
                    href={`/s/${siteSubdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition"
                  >
                    Open live site ↗
                  </a>
                )}
              </div>
              {/* Right: Insert link to page */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-black">Insert link to page:</span>
                <select
                  className="border rounded px-2 py-1 text-sm text-black bg-white"
                  onChange={e => {
                    const page = publishedPages.find(p => p.id === e.target.value);
                    if (page) handleInsertPageLink(page);
                    e.target.selectedIndex = 0;
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a page...</option>
                  {publishedPages.filter(p => p.id !== pageId).map(page => (
                    <option key={page.id} value={page.id}>{page.title}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Help text for creating a new page */}
            <div className="text-xs text-gray-500 mb-4">Use the dropdown to switch pages, or add a new one. Edit or publish/unpublish the current page.</div>
            {/* --- Preview above code editor --- */}
            {showPreview && (
              <div className="flex flex-col items-center w-full max-w-full mb-8">
                <h3 className="font-semibold mb-2" style={{color:"black"}}>Live Preview</h3>
                <div className="w-full flex justify-center">
                  <div style={{ width: deviceWidths[previewMode], border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', overflow: 'auto', maxWidth: '100%' }}>
                    <iframe
                      srcDoc={preview}
                      className="h-80 sm:h-96 border-none"
                      title="Live Preview"
                      style={{ width: '100%', minHeight: previewMode === 'desktop' ? '800px' : undefined }}
                    />
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <button className={`px-2 py-1 rounded ${previewMode==='desktop' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setPreviewMode('desktop')}>Desktop</button>
                  <button className={`px-2 py-1 rounded ${previewMode==='tablet' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setPreviewMode('tablet')}>Tablet</button>
                  <button className={`px-2 py-1 rounded ${previewMode==='mobile' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setPreviewMode('mobile')}>Mobile</button>
                </div>
              </div>
            )}
            {/* --- End top controls and preview --- */}

            {/* AI Code Assistant */}
              {/* AI Code Assistant UI */}
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
                  {mode === 'code' && typeof aiCode === 'object' && aiCode !== null ? (
                    <>
                      <div className="mb-2">
                        <span className="font-bold text-purple-700">HTML:</span>
                        <button
                          onClick={() => { setHtmlCode((aiCode as any).html || ''); toast.success('HTML code applied!'); }}
                          className="mb-2 ml-2 px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
                        >
                          Insert to HTML
                        </button>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto text-black">{(aiCode as any).html}</pre>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold text-blue-700">CSS:</span>
                        <button
                          onClick={() => { setCssCode((aiCode as any).css || ''); toast.success('CSS code applied!'); }}
                          className="mb-2 ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          Insert to CSS
                        </button>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto text-black">{(aiCode as any).css}</pre>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold text-green-700">JavaScript:</span>
                        <button
                          onClick={() => { setJsCode((aiCode as any).js || ''); toast.success('JavaScript code applied!'); }}
                          className="mb-2 ml-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition"
                        >
                          Insert to JavaScript
                        </button>
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto text-black">{(aiCode as any).js}</pre>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={handleCopyAICode}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs flex items-center gap-1 hover:bg-gray-700 transition"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => { handleInsertAICode(); toast.success('Code applied!'); }}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
                        >
                          Insert into Editor
                        </button>
                        <button
                          onClick={handleCopyAICode}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs flex items-center gap-1 hover:bg-gray-700 transition"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      {typeof aiCode === 'string' && (
                        <pre className="bg-white border rounded p-2 mt-1 overflow-x-auto text-black">{aiCode}</pre>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="w-full">
              <div className="mb-2 flex gap-2 items-center flex-wrap text-black">
                <button className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='html' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('html')}>HTML</button>
                <button className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='css' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('css')}>CSS</button>
                <button className={`px-4 py-2 rounded-t bg-gray-100 border-b-2 ${selectedTab==='js' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('js')}>JavaScript</button>
              </div>
              <div className="w-full h-80 sm:h-96 mb-4 max-w-full">
                {selectedTab === 'html' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="html"
                    language="html"
                    value={htmlCode}
                    onChange={value => setHtmlCode(value || "")}
                    theme="vs"
                    options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: 'on' }}
                  />
                )}
                {selectedTab === 'css' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="css"
                    language="css"
                    value={cssCode}
                    onChange={value => setCssCode(value || "")}
                    theme="vs"
                    options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: 'on' }}
                  />
                )}
                {selectedTab === 'js' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="javascript"
                    language="javascript"
                    value={jsCode}
                    onChange={value => setJsCode(value || "")}
                    theme="vs"
                    options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: 'on' }}
                  />
                )}
              </div>
            </div>
          </div>
          )
        )}
        {error && <div className="text-red-600 mt-4">{error}</div>}
        
      </div>
      
      <AddPageModal isOpen={addPageOpen} onClose={() => setAddPageOpen(false)} onAddPage={handleAddPage} />
        
      <EditPageModal isOpen={editPageOpen} onClose={() => setEditPageOpen(false)} page={currentPage} onEditPage={handleEditPage} />
    </DashboardLayout>
  );
} 