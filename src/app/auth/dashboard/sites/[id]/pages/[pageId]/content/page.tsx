"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';
import { CodeBracketIcon, SparklesIcon, ClipboardIcon, PlusIcon, TrashIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sandpack } from '@codesandbox/sandpack-react';
import AddPageModal from '@/components/dashboard/add-page-modal';
import EditPageModal from '@/components/dashboard/edit-page-modal';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { formTemplates } from '@/utils/formTemplates';

// Dynamically import MonacoEditor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type AICodeType = string | { html: string; css: string; js: string };

export default function ManageContentPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const pageId = params?.pageId as string;
  const [mode, setMode] = useState<'template'|'code'|'jsx'|null>(null);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'html'|'css'|'js'>('html');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [siteSubdomain, setSiteSubdomain] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'html'|'react'>('html');
  const [currentRenderMode, setCurrentRenderMode] = useState<'html'|'react'>('html');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCode, setAiCode] = useState<AICodeType>('');
  const [aiLoading, setAiLoading] = useState(false);
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  
  // Enhanced AI functionality state
  const [selectedCode, setSelectedCode] = useState('');
  const [isPartialUpdate, setIsPartialUpdate] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{html: string, css: string, js: string} | null>(null);
  const [originalCode, setOriginalCode] = useState<{html: string, css: string, js: string} | null>(null);
  const [showKeepDiscard, setShowKeepDiscard] = useState(false);
  const [aiEditorMinimized, setAiEditorMinimized] = useState(false);
  
  // Image input state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Image enhancement state
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [requestedImages, setRequestedImages] = useState<string[]>([]);
  const [imageInputs, setImageInputs] = useState<{[key: string]: string}>({});
  const [imagePromptLoading, setImagePromptLoading] = useState(false);
  const [publishedPages, setPublishedPages] = useState<any[]>([]);
  const router = useRouter();
  const [allPages, setAllPages] = useState<any[]>([]); // all pages, not just published
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [editPageOpen, setEditPageOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [addFormModalOpen, setAddFormModalOpen] = useState(false);
  const [addFormStep, setAddFormStep] = useState<'choose' | 'position'>('choose');
  const [selectedFormType, setSelectedFormType] = useState<null | 'contact'>(null);
  const [insertionPosition, setInsertionPosition] = useState<'afterSelection' | 'top' | 'bottom' | 'selector'>('afterSelection');
  const [insertionSelector, setInsertionSelector] = useState('');
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [linkConfigModalOpen, setLinkConfigModalOpen] = useState(false);
  const [identifiedElements, setIdentifiedElements] = useState<Array<{
    id: string;
    type: 'button' | 'link' | 'clickable';
    text: string;
    tagName: string;
    className: string;
    originalHtml: string;
    targetPageId: string | null;
  }>>([]);
  const [linkConfigStep, setLinkConfigStep] = useState<'identify' | 'configure' | 'review'>('identify');

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
        // Clear the draft since it's now published
        clearFormDraft();
        setHasDraft(false);
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
        .then(data => {
          console.log('Fetched templates:', data);
          // setTemplates(data);
        })
        .catch(() => setError(''));
      fetch('/api/templates/purchased')
        .then(res => res.json())
        .then(data => {
          console.log('Fetched purchased templates:', data);
          setPurchased(data);
        })
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
      // Clear the draft since the page has been updated
      clearFormDraft();
      setHasDraft(false);
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
    // Find the template to show more specific information
    const template = purchased.find(t => t.id === templateId);
    const templateName = template?.name || 'this template';
    
    // Log template data for debugging
    console.log('Template to apply:', template);
    console.log('Template pages:', template?.pages);
    
    // Check if template has required data
    if (!template) {
      toast.error('Template not found. Please refresh and try again.');
      return;
    }
    
    if (!template.pages || typeof template.pages !== 'object') {
      toast.error('This template is missing page data. Please contact support.');
      console.error('Template missing pages:', template);
      return;
    }
    
    // Show detailed confirmation dialog
    const confirmed = window.confirm(
      `⚠️ Warning: Applying "${templateName}" will replace ALL current pages in your website.\n\n` +
      'This action cannot be undone. Are you sure you want to continue?\n\n' +
      '✅ All existing pages will be deleted\n' +
      '✅ New pages will be created from the template\n' +
      '✅ Navigation links will be automatically updated\n' +
      '✅ Your website will be completely rebuilt\n\n' +
      '📄 Template pages: ' + Object.keys(template.pages).join(', ') + '\n' +
      '🌐 Your site subdomain: ' + (siteSubdomain || 'Loading...')
    );
    
    if (!confirmed) return;
    
    setIsApplyingTemplate(true);
    const toastId = toast.loading('Applying template... This may take a moment.');
    
    try {
      console.log('Sending template application request for template:', templateId);
      
      // Apply template at site level, not page level
      const res = await fetch(`/api/sites/${siteId}/apply-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      
      console.log('Template application response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Template application successful:', data);
        toast.success(`Template applied successfully! Created ${data.totalPages} pages.`, { id: toastId });
        
        // Clear the draft since new template content is now loaded
        clearFormDraft();
        setHasDraft(false);
        
        // Refresh the page content to show the new template
        await refreshPageContent();
        
        // Refresh the pages list to show new pages
        if (siteId) {
          const pagesRes = await fetch(`/api/pages?siteId=${siteId}`);
          if (pagesRes.ok) {
            const pages = await pagesRes.json();
            setAllPages(pages);
            setPublishedPages(pages.filter((p: any) => p.isPublished));
          }
        }
        
        // Redirect to the home page after successful template application
        if (data.pageSlugs && data.pageSlugs.length > 0) {
          const homePage = data.pageSlugs.find((p: any) => p.slug === 'home') || data.pageSlugs[0];
          if (homePage && homePage.id !== pageId) {
            // Add a small delay to ensure the user sees the success message
            setTimeout(() => {
              router.push(`/auth/dashboard/sites/${siteId}/pages/${homePage.id}/content`);
            }, 1500);
          }
        }
      } else {
        const err = await res.json();
        console.error('Template application failed:', err);
        toast.error(err.error || 'Failed to apply template', { id: toastId });
      }
    } catch (error) {
      console.error('Template application error:', error);
      toast.error('Failed to apply template. Please try again.', { id: toastId });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  // Handler for publishing all code files
  const handlePublishCode = async (customHtml?: string) => {
    const htmlToPublish = customHtml || htmlCode;
    console.log('handlePublishCode called');
    console.log('Current htmlCode length:', htmlCode.length);
    console.log('Custom HTML length:', customHtml?.length || 'none');
    console.log('HTML to publish length:', htmlToPublish.length);
    console.log('HTML to publish preview:', htmlToPublish.substring(0, 200));
    
    setLoading(true);
    const toastId = toast.loading('Publishing...');
    try {
      const newRenderMode = 'html';
      const res = await fetch(`/api/pages/${pageId}/save-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlCode: htmlToPublish, cssCode, jsCode, renderMode: newRenderMode }),
      });
      if (res.ok) {
        toast.success('HTML/CSS/JS is now live!', { id: toastId });
        setCurrentRenderMode(newRenderMode);
        setRenderMode(newRenderMode);
        // Clear the draft since it's now published
        clearFormDraft();
        setHasDraft(false);
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

  // Auto-generate preview whenever code changes
  useEffect(() => {
    const doc = `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}</script></body></html>`;
    setPreview(doc);
  }, [htmlCode, cssCode, jsCode]);

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

  // Enhanced AI helper functions
  const extractCodeBlocks = (aiCode: any) => {
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
      // If no blocks, treat as plain code and determine type
      if (!html && !css && !js && aiCode.trim()) {
        const cleanCode = aiCode.trim();
        // Simple heuristics to determine code type
        if (cleanCode.includes('<!DOCTYPE') || cleanCode.includes('<html') || cleanCode.includes('<div')) {
          html = cleanCode;
        } else if (cleanCode.includes('{') && cleanCode.includes('}') && (cleanCode.includes('color') || cleanCode.includes('background'))) {
          css = cleanCode;
        } else {
          html = cleanCode;
        }
      }
    }
    return { html, css, js };
  };

  // Handle image file selection for AI input
  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle code selection from Monaco Editor
  const handleCodeSelection = (selectedText: string) => {
    setSelectedCode(selectedText);
    setIsPartialUpdate(true);
  };

  // Auto-apply images from Unsplash without user input
  const autoApplyImages = async (htmlCode: string, cssCode: string) => {
    // Show loading toast
    const loadingToastId = toast.loading('🖼️ Adding beautiful images to your website...', {
      position: 'top-right',
      duration: 0 // Keep it until we dismiss it
    });
    
    try {
      console.log('Starting auto-image application...');
      const res = await fetch('/api/auto-apply-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlCode, cssCode })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Auto-applied images:', data.appliedImages);
        
        if (data.appliedImages && data.appliedImages.length > 0) {
          // Apply the enhanced code with images
          setHtmlCode(data.html);
          setCssCode(data.css);
          if (data.js) setJsCode(data.js);
          
          // Clear the draft since new content with images is now loaded
          clearFormDraft();
          setHasDraft(false);
          
          // Dismiss loading toast and show success
          toast.dismiss(loadingToastId);
          toast.success(`🖼️ Successfully added ${data.appliedImages.length} high-quality images!`, {
            position: 'top-right',
            duration: 4000
          });
        } else {
          console.log('No images were needed for this website');
          toast.dismiss(loadingToastId);
          toast('Website looks complete! No additional images needed.', {
            position: 'top-right',
            duration: 3000
          });
        }
      } else {
        const errorData = await res.json();
        console.error('Auto-image application failed:', errorData);
        toast.dismiss(loadingToastId);
        toast.error('Failed to auto-apply images', {
          position: 'top-right',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error in auto-image application:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to auto-apply images', {
        position: 'top-right',
        duration: 4000
      });
    }
  };

  // Analyze code for image requirements (kept for manual use)
  const analyzeImageRequirements = async (htmlCode: string) => {
    try {
      console.log('Starting image analysis...');
      setImagePromptLoading(true);
      
      const res = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlCode }),
      });
      
      console.log('Analysis response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Analysis response data:', data);
        
        if (data.images && data.images.length > 0) {
          console.log('Found images to request:', data.images);
          setRequestedImages(data.images);
          setImageInputs(data.images.reduce((acc: any, img: string) => ({ ...acc, [img]: '' }), {}));
          setShowImagePrompt(true);
          toast.success(`Found ${data.images.length} image opportunities for your website!`);
        } else {
          console.log('No images needed for this website');
          toast.success('Your website looks complete! No additional images needed.');
        }
      } else {
        const errorData = await res.json();
        console.error('Analysis failed:', errorData);
        toast.error('Failed to analyze image requirements');
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
      toast.error('Error analyzing images: ' + error);
    } finally {
      setImagePromptLoading(false);
    }
  };

  // Apply images to code
  const applyImagesToCode = async () => {
    if (!requestedImages.length) return;
    
    setImagePromptLoading(true);
    try {
      const res = await fetch('/api/apply-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          htmlCode: htmlCode,
          cssCode: cssCode,
          imageLinks: imageInputs
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setHtmlCode(data.html || htmlCode);
        setCssCode(data.css || cssCode);
        
        // Clear the draft since new content with images is now loaded
        clearFormDraft();
        setHasDraft(false);
        
        setShowImagePrompt(false);
        setRequestedImages([]);
        setImageInputs({});
        toast.success('Images applied to your website!');
        
        // Auto-scroll to preview
        setTimeout(() => {
          const previewElement = document.getElementById('website-preview');
          if (previewElement) {
            previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error applying images:', error);
      toast.error('Failed to apply images');
    } finally {
      setImagePromptLoading(false);
    }
  };

  // Enhanced AI Code generation with image support and partial updates
  const handleEnhancedAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiCode('');
    
    // Store original code before making changes
    const currentPageCode = { html: htmlCode, css: cssCode, js: jsCode };
    setOriginalCode(currentPageCode);
    
    try {
      const currentCode = `${htmlCode}\n\n${cssCode}\n\n${jsCode}`;
      
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('prompt', aiPrompt);
      formData.append('mode', 'code');
      formData.append('currentCode', currentCode);
      formData.append('selectedCode', selectedCode);
      formData.append('isPartialUpdate', isPartialUpdate.toString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch('/api/generate-code', {
        method: 'POST',
        body: formData, // Use FormData instead of JSON for image support
      });
      
      if (res.ok) {
        const data = await res.json();
        const codeBlocks = extractCodeBlocks(data.code);
        
        if (isPartialUpdate && selectedCode) {
          // For partial updates, only replace the selected code in the current tab
          const currentTabCode = selectedTab === 'html' ? htmlCode : selectedTab === 'css' ? cssCode : jsCode;
          // Use the AI response directly as the replacement, clean it up
          let replacementCode = typeof data.code === 'string' ? data.code.trim() : '';
          
          // Remove any markdown code block markers if present
          replacementCode = replacementCode.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
          
          // Ensure we only replace the first occurrence of the selected code
          const selectedCodeIndex = currentTabCode.indexOf(selectedCode);
          if (selectedCodeIndex !== -1) {
            const beforeSelected = currentTabCode.substring(0, selectedCodeIndex);
            const afterSelected = currentTabCode.substring(selectedCodeIndex + selectedCode.length);
            const updatedTabCode = beforeSelected + replacementCode + afterSelected;
            
            if (selectedTab === 'html') {
              setHtmlCode(updatedTabCode);
            } else if (selectedTab === 'css') {
              setCssCode(updatedTabCode);
            } else {
              setJsCode(updatedTabCode);
            }
          }
        } else {
          // For full updates, apply all code blocks
          if (codeBlocks.html) setHtmlCode(codeBlocks.html);
          if (codeBlocks.css) setCssCode(codeBlocks.css);
          if (codeBlocks.js) setJsCode(codeBlocks.js);
        }
        
        setAiCode(data.code);
        setShowKeepDiscard(true);
        toast.success('AI code applied! Choose to keep or discard changes.');
        
        // Clear selected image after successful generation
        if (selectedImage) {
          clearSelectedImage();
        }
        
        // Auto-scroll to preview section
        setTimeout(() => {
          const previewElement = document.getElementById('website-preview');
          if (previewElement) {
            previewElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
        
                      // For full updates, automatically apply images from Unsplash
              if (!isPartialUpdate) {
                setTimeout(() => {
                  const htmlToAnalyze = codeBlocks.html || htmlCode || '';
                  const cssToAnalyze = codeBlocks.css || cssCode || '';
                  if (htmlToAnalyze.trim()) {
                    console.log('Auto-applying images from Unsplash...');
                    autoApplyImages(htmlToAnalyze, cssToAnalyze);
                  }
                }, 1500);
              }
      } else {
        setAiCode('');
        toast.error('Failed to generate code');
      }
    } catch (error) {
      setAiCode('');
      toast.error('Failed to generate code');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle keep changes
  const handleKeepChanges = () => {
    setPendingChanges(null);
    setOriginalCode(null);
    setShowKeepDiscard(false);
    setSelectedCode('');
    setIsPartialUpdate(false);
    toast.success('Changes kept successfully!');
    
    // Clear the draft since the changes are now part of the main content
    clearFormDraft();
    setHasDraft(false);
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    // Revert to original code
    if (originalCode) {
      setHtmlCode(originalCode.html);
      setCssCode(originalCode.css);
      setJsCode(originalCode.js);
      
      setPendingChanges(null);
      setOriginalCode(null);
      setShowKeepDiscard(false);
      setSelectedCode('');
      setIsPartialUpdate(false);
      toast.success('Changes discarded successfully!');
      
      // Clear the draft since we're reverting to the original content
      clearFormDraft();
      setHasDraft(false);
    }
  };

  const handleInsertAICode = () => {
    if (mode === 'jsx') setJsxCode(aiCode as string);
    else if (mode === 'code' && typeof aiCode === 'object' && aiCode !== null) {
      if (selectedTab === 'html') setHtmlCode((aiCode as any).html || '');
      else if (selectedTab === 'css') setCssCode((aiCode as any).css || '');
      else if (selectedTab === 'js') setJsCode((aiCode as any).js || '');
    }
    // Clear the draft since new AI-generated content is now inserted
    clearFormDraft();
    setHasDraft(false);
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

  // Function to refresh page content (useful after template application)
  const refreshPageContent = async () => {
    if (!pageId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setHtmlCode(data.htmlCode || '');
        setCssCode(data.cssCode || '');
        setJsCode(data.jsCode || '');
        setRenderMode(data.renderMode || 'html');
        setCurrentRenderMode(data.renderMode || 'html');
        
        // Also refresh the current page info
        if (siteId) {
          const pagesRes = await fetch(`/api/pages?siteId=${siteId}`);
          if (pagesRes.ok) {
            const pages = await pagesRes.json();
            setAllPages(pages);
            setPublishedPages(pages.filter((p: any) => p.isPublished));
            const found = pages.find((p: any) => p.id === pageId);
            setCurrentPage(found || null);
          }
        }
        
        // Clear the draft since fresh content is now loaded
        clearFormDraft();
        setHasDraft(false);
        toast.success('Page content refreshed successfully!');
      } else if (res.status === 404 && siteId) {
        // Current page was deleted (likely due to template application). Redirect to the new home/first page.
        const pagesRes = await fetch(`/api/pages?siteId=${siteId}`);
        if (pagesRes.ok) {
          const pages = await pagesRes.json();
          if (Array.isArray(pages) && pages.length > 0) {
            const home = pages.find((p: any) => p.slug === 'home') || pages[0];
            if (home?.id) {
              router.push(`/auth/dashboard/sites/${siteId}/pages/${home.id}/content`);
              return;
            }
          }
        }
        toast.error('The current page no longer exists. Please select another page.');
      }
    } catch (error) {
      console.error('Failed to refresh page content:', error);
      toast.error('Failed to refresh page content');
    } finally {
      setLoading(false);
    }
  };

  // Check if page content needs refresh (e.g., after template application)
  useEffect(() => {
    // This will run when the component mounts and when pageId changes
    // It ensures we have the latest content, especially after template application
    if (pageId && mode === 'code') {
      refreshPageContent();
    }
  }, [pageId]); // Only depend on pageId to avoid infinite loops

  // Check for template application completion and notify user
  useEffect(() => {
    // Check if we're coming from a template application
    const urlParams = new URLSearchParams(window.location.search);
    const templateApplied = urlParams.get('templateApplied');
    
    if (templateApplied === 'true') {
      toast.success('🎉 Template applied successfully! Your new website is ready.', {
        duration: 5000,
        position: 'top-right'
      });
      
      // Remove the query parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('templateApplied');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Auto-refresh the content after a short delay
      setTimeout(() => {
        refreshPageContent();
      }, 1000);
    }
  }, []); // Only run once on mount

  // Template marketplace/user state

  // Insert template code to editor
  const handleInsertTemplate = (tpl: any) => {
    setHtmlCode(tpl.html || '');
    setCssCode(tpl.css || '');
    setJsCode(tpl.js || '');
    // Clear the draft since new template content is now loaded
    clearFormDraft();
    setHasDraft(false);
    toast.success('Template code inserted!');
  };
  
  // Preview template structure before applying
  const handlePreviewTemplate = (tpl: any) => {
    if (tpl.pages) {
      const pageCount = Object.keys(tpl.pages).length;
      const pageList = Object.keys(tpl.pages).map(key => 
        `• ${key.charAt(0).toUpperCase() + key.slice(1)} page`
      ).join('\n');
      
      // Create a more detailed preview with page content
      let previewContent = `📋 Template Preview: ${tpl.name}\n\n`;
      previewContent += `📄 This template contains ${pageCount} pages:\n${pageList}\n\n`;
      
      // Show sample content from first page if available
      if (tpl.html && tpl.html.length > 0) {
        const sampleHtml = tpl.html.substring(0, 200) + (tpl.html.length > 200 ? '...' : '');
        previewContent += `🔍 Sample HTML content:\n${sampleHtml}\n\n`;
      }
      
      previewContent += `💡 When applied, this will:\n`;
      previewContent += `• Delete all current pages\n`;
      previewContent += `• Create ${pageCount} new pages\n`;
      previewContent += `• Update all navigation links\n`;
      previewContent += `• Rebuild your entire website\n\n`;
      
      if (tpl.price === 0) {
        previewContent += `✅ This template is FREE!\n`;
      } else {
        previewContent += `💰 Price: ₹${tpl.price}\n`;
      }
      
      previewContent += `\nClick "Apply Template" to proceed.`;
      
      alert(previewContent);
    } else {
      alert(`📋 Template Preview: ${tpl.name}\n\nThis is a single-page template.`);
    }
  };
  // Insert form into HTML code with placement options
  const insertFormAtPosition = (
    formType: 'contact',
    position: 'afterSelection' | 'top' | 'bottom' | 'selector',
    selector?: string
  ) => {
    const formHTML = formTemplates[formType](siteId);
    let newHTML = htmlCode;

    try {
      if (position === 'top') {
        newHTML = formHTML + '\n\n' + htmlCode;
      } else if (position === 'bottom') {
        newHTML = htmlCode + '\n\n' + formHTML;
      } else if (position === 'afterSelection' && selectedCode) {
        const idx = htmlCode.indexOf(selectedCode);
        if (idx !== -1) {
          newHTML = htmlCode.slice(0, idx + selectedCode.length) + '\n\n' + formHTML + htmlCode.slice(idx + selectedCode.length);
        } else {
          newHTML = htmlCode + '\n\n' + formHTML;
        }
      } else if (position === 'selector' && selector) {
        // Parse DOM and insert after the first element that matches selector
        const container = document.createElement('div');
        container.innerHTML = htmlCode;
        const target = container.querySelector(selector);
        if (target) {
          const marker = document.createElement('div');
          marker.innerHTML = formHTML;
          target.insertAdjacentElement('afterend', marker);
          newHTML = container.innerHTML;
        } else {
          newHTML = htmlCode + '\n\n' + formHTML;
        }
      } else {
        newHTML = htmlCode + '\n\n' + formHTML;
      }
    } catch (e) {
      console.error('Failed to insert form at position, falling back to append at bottom', e);
      newHTML = htmlCode + '\n\n' + formHTML;
    }

    setHtmlCode(newHTML);
    clearFormDraft();
    setHasDraft(false);
    setAddFormModalOpen(false);
    setAddFormStep('choose');
    setSelectedFormType(null);
    toast.success(`${formType.charAt(0).toUpperCase() + formType.slice(1)} form added to your page!`);
  };

  // Buy template (Razorpay)
  const handleBuyTemplate = (tpl: any) => {
    router.push(`/auth/dashboard/marketplace?template=${tpl.id}`);
  };


  // localStorage persistence for form state
  const getInitialForm = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem(`content-form-draft-${pageId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if we have meaningful content
        if (parsed.htmlCode || parsed.cssCode || parsed.jsCode) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to parse saved form data:', error);
    }
    return null;
  };

  // Save form state to localStorage
  const saveFormToStorage = (formData: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`content-form-draft-${pageId}`, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  // Clear form draft from localStorage
  const clearFormDraft = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(`content-form-draft-${pageId}`);
      toast.success('Draft cleared successfully!');
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  };

  // Check if we have a saved draft
  const [hasDraft, setHasDraft] = useState(false);

  // Load initial form data from localStorage if available
  useEffect(() => {
    const savedForm = getInitialForm();
    if (savedForm) {
      setHtmlCode(savedForm.htmlCode || '');
      setCssCode(savedForm.cssCode || '');
      setJsCode(savedForm.jsCode || '');
      setHasDraft(true);
      toast.success('💾 Draft restored from previous session!');
    }
  }, [pageId]);

  // Auto-save form state to localStorage when content changes
  useEffect(() => {
    if (pageId && (htmlCode || cssCode || jsCode)) {
      const formData = { htmlCode, cssCode, jsCode };
      saveFormToStorage(formData);
      setHasDraft(true);
    }
  }, [htmlCode, cssCode, jsCode, pageId]);

  // Cleanup: clear draft when pageId changes or component unmounts
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts or pageId changes
      // We don't clear the draft here as we want to preserve it for the same page
    };
  }, [pageId]);

  // Function to identify clickable elements in HTML
  const identifyClickableElements = (html: string) => {
    console.log('identifyClickableElements called with HTML length:', html.length);
    console.log('HTML preview:', html.substring(0, 300));
    
    const elements: Array<{
      id: string;
      type: 'button' | 'link' | 'clickable';
      text: string;
      tagName: string;
      className: string;
      originalHtml: string;
      targetPageId: string | null;
    }> = [];

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Helper to map an href value to a pageId if it matches one of the site's pages
    const findPageIdFromHref = (href: string | null): string | null => {
      if (!href) return null;
      try {
        const url = new URL(href, window.location.origin);
        // Pattern: /s/{subdomain}?page={slug}
        if (siteSubdomain && url.pathname === `/s/${siteSubdomain}`) {
          const slug = url.searchParams.get('page');
          if (slug) {
            const page = publishedPages.find(p => p.slug === slug);
            if (page) return page.id;
          }
        }
        // Pattern: /{slug}
        if (url.pathname && url.pathname.startsWith('/') && url.pathname.length > 1) {
          const slug = url.pathname.replace(/^\//, '').replace(/\.html?$/i, '');
          const page = publishedPages.find(p => p.slug === slug);
          if (page) return page.id;
        }
      } catch {
        // Relative or hash-only hrefs
        const cleaned = href.replace(/^\//, '').replace(/\.html?$/i, '');
        if (cleaned && cleaned !== '#' && !cleaned.startsWith('http')) {
          const possibleSlug = cleaned.includes('#') ? cleaned.split('#')[0] : cleaned;
          const page = publishedPages.find(p => p.slug === possibleSlug);
          if (page) return page.id;
        }
      }
      return null;
    };

    // Find buttons
    const buttons = tempDiv.querySelectorAll('button, input[type="button"], input[type="submit"]');
    console.log('Found buttons:', buttons.length);
    buttons.forEach((button, index) => {
      const text = button.textContent?.trim() || button.getAttribute('value') || `Button ${index + 1}`;
      // Look for an enclosing anchor to infer an existing navigation target
      let preselectedId: string | null = null;
      const parentAnchor = button.closest('a[href]');
      if (parentAnchor) {
        preselectedId = findPageIdFromHref(parentAnchor.getAttribute('href'));
      }
      const element = {
        id: `btn-${index}`,
        type: 'button' as const,
        text,
        tagName: button.tagName.toLowerCase(),
        className: button.className || '',
        originalHtml: button.outerHTML,
        targetPageId: preselectedId
      };
      elements.push(element);
      console.log('Added button element:', element, 'preselected target:', preselectedId);
    });

    // Find links
    const links = tempDiv.querySelectorAll('a[href]');
    console.log('Found links:', links.length);
    links.forEach((link, index) => {
      const text = link.textContent?.trim() || `Link ${index + 1}`;
      const href = link.getAttribute('href');
      // Only include internal links or links that could be navigation
      if (href && (href.startsWith('#') || href.startsWith('/') || !href.includes('http'))) {
        const preselectedId = findPageIdFromHref(href);
        const element = {
          id: `link-${index}`,
          type: 'link' as const,
          text,
          tagName: 'a',
          className: link.className || '',
          originalHtml: link.outerHTML,
          targetPageId: preselectedId
        };
        elements.push(element);
        console.log('Added link element:', element, 'preselected target:', preselectedId);
      }
    });

    // Find clickable divs (with onclick or cursor pointer)
    const clickableDivs = tempDiv.querySelectorAll('div[onclick], div[style*="cursor: pointer"], div[style*="cursor:pointer"]');
    console.log('Found clickable divs:', clickableDivs.length);
    clickableDivs.forEach((div, index) => {
      const text = div.textContent?.trim() || `Clickable Element ${index + 1}`;
      // Infer existing link if wrapped in an anchor
      let preselectedId: string | null = null;
      const parentAnchor = div.closest('a[href]');
      if (parentAnchor) {
        preselectedId = findPageIdFromHref(parentAnchor.getAttribute('href'));
      }
      const element = {
        id: `div-${index}`,
        type: 'clickable' as const,
        text,
        tagName: 'div',
        className: div.className || '',
        originalHtml: div.outerHTML,
        targetPageId: preselectedId
      };
      elements.push(element);
      console.log('Added clickable div element:', element, 'preselected target:', preselectedId);
    });

    console.log('Total elements found:', elements.length);
    return elements;
  };

  // Function to update HTML with navigation links (DOM-based for robust replacements)
  const updateHtmlWithNavigationLinks = (
    html: string,
    elementMappings: Array<{ id: string; targetPageId: string }>
  ) => {
    console.log('updateHtmlWithNavigationLinks called with:', {
      html: html.substring(0, 200),
      elementMappings,
      siteSubdomain,
    });

    if (!siteSubdomain) {
      console.error('siteSubdomain is not available');
      toast.error('Site subdomain not available. Please try again.');
      return html;
    }

    if (elementMappings.length === 0) {
      console.log('No element mappings provided');
      return html;
    }

    // Parse the incoming HTML into a temporary container so we can manipulate real nodes
    const container = document.createElement('div');
    container.innerHTML = html;

    const getIndexFromId = (id: string) => {
      const parts = id.split('-');
      const n = parseInt(parts[1] || '0', 10);
      return Number.isFinite(n) ? n : 0;
    };

    let replacementsMade = 0;

    elementMappings.forEach((mapping) => {
      const elementMeta = identifiedElements.find((el) => el.id === mapping.id);
      console.log('Processing mapping:', mapping, 'Element meta:', elementMeta);

      if (!elementMeta) return;
      const targetPage = publishedPages.find((p) => p.id === mapping.targetPageId);
      if (!targetPage) return;

      const url = `/s/${siteSubdomain}?page=${targetPage.slug}`;
      const index = getIndexFromId(elementMeta.id);

      let node: Element | null = null;
      if (elementMeta.id.startsWith('btn-')) {
        const nodes = container.querySelectorAll('button, input[type="button"], input[type="submit"]');
        node = nodes[index] as Element | undefined || null;
      } else if (elementMeta.id.startsWith('link-')) {
        const nodes = container.querySelectorAll('a[href]');
        node = nodes[index] as Element | undefined || null;
      } else if (elementMeta.id.startsWith('div-')) {
        const nodes = container.querySelectorAll(
          'div[onclick], div[style*="cursor: pointer"], div[style*="cursor:pointer"]'
        );
        node = nodes[index] as Element | undefined || null;
      }

      if (!node) {
        console.log('Could not locate node in parsed HTML for', elementMeta.id);
        return;
      }

      // If it is already an anchor element, update its href and classes
      if (node.tagName.toLowerCase() === 'a') {
        (node as HTMLAnchorElement).setAttribute('href', url);
        (node as HTMLAnchorElement).setAttribute('target', '_top');
        node.classList.add('nav-link');
        if (!node.textContent || !node.textContent.trim()) {
          node.textContent = elementMeta.text;
        }
        replacementsMade++;
        return;
      }

      const lowerTag = node.tagName.toLowerCase();
      const anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.setAttribute('target', '_top');

      // If original node is a button/input, replace it with an anchor styled like the button
      if (lowerTag === 'button' || (lowerTag === 'input' && (node as HTMLInputElement).type === 'button') || (lowerTag === 'input' && (node as HTMLInputElement).type === 'submit')) {
        const className = (node as HTMLElement).className || '';
        anchor.className = `${className} nav-link`.trim();
        const text = lowerTag === 'button' ? (node as HTMLButtonElement).innerHTML : ((node as HTMLInputElement).value || elementMeta.text);
        anchor.innerHTML = text || elementMeta.text;
        node.replaceWith(anchor);
        replacementsMade++;
        return;
      }

      // Otherwise, wrap the existing node with an anchor (keep original content/structure)
      anchor.className = 'nav-link';
      anchor.appendChild(node.cloneNode(true));
      node.replaceWith(anchor);
      replacementsMade++;
    });

    const updatedHtml = container.innerHTML;
    console.log('Total replacements made:', replacementsMade);
    console.log('Final updated HTML preview:', updatedHtml.substring(0, 300));

    if (replacementsMade === 0) {
      toast.error('No HTML elements were updated. This might happen if the HTML structure changed.');
    }

    return updatedHtml;
  };

  // Function to handle link configuration
  const handleLinkConfiguration = () => {
    console.log('handleLinkConfiguration called');
    console.log('Current htmlCode length:', htmlCode.length);
    console.log('Current htmlCode preview:', htmlCode.substring(0, 300));
    
    const elements = identifyClickableElements(htmlCode);
    console.log('Elements identified:', elements);
    
    setIdentifiedElements(elements);
    setLinkConfigStep('identify');
    setLinkConfigModalOpen(true);
  };

  // Function to proceed to configuration step
  const handleProceedToConfigure = () => {
    console.log('handleProceedToConfigure called');
    console.log('Current identifiedElements:', identifiedElements);
    console.log('identifiedElements length:', identifiedElements.length);
    
    if (identifiedElements.length === 0) {
      toast.error('No clickable elements found in your HTML. Please add some buttons or links first.');
      return;
    }
    setLinkConfigStep('configure');
  };

  // Function to handle element mapping
  const handleElementMapping = (elementId: string, targetPageId: string) => {
    console.log('handleElementMapping called with:', { elementId, targetPageId });
    console.log('Before mapping - identifiedElements:', identifiedElements);
    
    setIdentifiedElements(prev => {
      const updated = prev.map(el => 
        el.id === elementId ? { ...el, targetPageId } : el
      );
      console.log('After mapping - updated elements:', updated);
      return updated;
    });
  };

  // Function to finalize and publish
  const handleFinalizeAndPublish = () => {
    console.log('handleFinalizeAndPublish called');
    console.log('Current identifiedElements:', identifiedElements);
    console.log('Current htmlCode length:', htmlCode.length);
    console.log('Current siteSubdomain:', siteSubdomain);
    console.log('Current publishedPages:', publishedPages);

    const mappedElements = identifiedElements.filter(el => el.targetPageId);
    console.log('Mapped elements:', mappedElements);

    if (mappedElements.length === 0) {
      toast.error('Please configure at least one navigation link before publishing.');
      return;
    }

    // Update HTML with navigation links
    const updatedHtml = updateHtmlWithNavigationLinks(htmlCode,
      mappedElements.map(el => ({ id: el.id, targetPageId: el.targetPageId! }))
    );

    console.log('HTML update result - Original length:', htmlCode.length, 'Updated length:', updatedHtml.length);
    console.log('HTML was changed:', htmlCode !== updatedHtml);

    // Close modal and proceed with publishing
    setLinkConfigModalOpen(false);
    setLinkConfigStep('identify');
    setIdentifiedElements([]);

    // Call handlePublishCode with the updated HTML directly
    console.log('Calling handlePublishCode with updated HTML');
    handlePublishCode(updatedHtml);
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Manage Page Content</h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-300 font-medium">
          Choose how you want to build this page.
        </p>
        {mode === 'code' && siteSubdomain && currentPage && (
          <a
            href={`/s/${siteSubdomain}?page=${currentPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 underline text-base font-medium"
          >
            Visit Live Site ↗
          </a>
        )}
      </div>
      <div className="bg-white dark:bg-black shadow-xl rounded-3xl p-8 sm:p-10 mb-8 w-full border-2 border-purple-100 dark:border-gray-800">
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
          
            <label className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">💡 Template Application Guide</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Apply to Website:</strong> This will replace ALL current pages with the template pages, creating a complete new website structure. 
                All navigation links will be automatically updated to work with your site.
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                <strong>Preview:</strong> See what pages the template contains before applying.
              </p>
            </div>
            
            {/* Marketplace Button */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Need More Templates?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Explore our collection of professionally designed templates to enhance your website.
                </p>
                <a
                  href="/auth/dashboard/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Browse Templates
                </a>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold mb-4">My Purchased Templates</h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-700 dark:text-green-300 text-sm">
                <strong>Ready to use:</strong> These templates are already purchased and can be applied to your website immediately.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchased.map(t => (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Template Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.name}</h3>
                      {t.category && (
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {t.pages && (
                        <span className="flex items-center gap-1">
                          <span className="text-purple-600 dark:text-purple-400">📄</span>
                          <span className="font-medium">{Object.keys(t.pages).length} pages</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Template Actions */}
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2" 
                        onClick={() => handlePreviewTemplate(t)}
                        title="See what pages this template contains"
                      >
                        <span className="text-purple-600">👁️</span>
                        Preview
                      </button>
                      <button 
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                        onClick={() => handleApplyTemplate(t.id)}
                        title="Replace entire website with this template"
                        disabled={isApplyingTemplate}
                      >
                        {isApplyingTemplate ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Applying...
                          </>
                        ) : (
                          <>
                            <span className="text-white">🚀</span>
                            Apply to Website
                          </>
                        )}
                      </button>
                    </div>
                  </div>
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
          <div className="flex flex-col gap-6 w-full bg-white dark:bg-black">
            
            {/* --- Top controls: all in a single row above AI Code Assistant --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 w-full">
              {/* Left: Page switcher, Add/Edit/Publish/Unpublish */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Page:</span>
                <select
                  className="border rounded px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1"
                  onClick={() => setAddPageOpen(true)}
                >
                  <AddIcon fontSize="small" /> <PlusIcon className="h-4 w-4" /> Add New Page
                </button>
                <button
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1"
                  onClick={() => setEditPageOpen(true)}
                  disabled={!currentPage}
                >
                  <EditIcon fontSize="small" /> Edit Page
                </button>
                {currentPage && (
                  <button
                    className={`px-3 py-1 rounded border font-semibold transition flex items-center gap-1 ${currentPage.isPublished ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' : 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'}`}
                    onClick={handleTogglePublish}
                  >
                    {currentPage.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {currentPage && (
                  <button
                    className="px-3 py-1 rounded border border-red-500 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-1"
                    onClick={handleDeletePage}
                  >
                    <DeleteIcon fontSize="small" /> Delete Page
                  </button>
                )}
                <Button variant="outlined" color="primary" onClick={() => window.open('/auth/dashboard/marketplace', '_blank')} startIcon={<ShoppingCartIcon className="h-5 w-5" />}>Buy Templates</Button>
                <Button variant="outlined" color="primary" onClick={() => setAddFormModalOpen(true)} startIcon={<PlusIcon className="h-5 w-5" />}>Add Form</Button>
              </div>
              {/* Center: Main action buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                <button className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={handleLinkConfiguration} disabled={loading}>
                  {loading ? 'Publishing...' : 'Save and Publish'}
                </button>
                <button className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => setMode(null)}>
                  Back
                </button>
                <button className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() =>{ handlePreview();setShowPreview(v => !v);}}>
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                {siteSubdomain && currentPage && (
                  <a
                    href={`/s/${siteSubdomain}?page=${currentPage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Open live site ↗
                  </a>
                )}
              </div>
              {/* Right: Insert link to page and refresh button */}
              <div className="flex items-center gap-2">
                {/* Draft indicator and clear button */}
                {hasDraft && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">💾 Draft saved</span>
                    <button
                      onClick={clearFormDraft}
                      className="px-2 py-1 rounded border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      title="Clear saved draft"
                    >
                      Clear Draft
                    </button>
                  </div>
                )}
                <button
                  onClick={refreshPageContent}
                  disabled={loading}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1"
                  title="Refresh page content (useful after template application)"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>

              </div>
            </div>
            {/* Help text for creating a new page */}
            <div className="text-xs text-gray-500 mb-4">
              Use the dropdown to switch pages, or add a new one. Edit or publish/unpublish the current page. 
              <span className="text-blue-600 dark:text-blue-400 font-medium"> 💡 After applying a template, use the Refresh button to see the new content!</span>
            </div>
            {/* --- Preview above code editor --- */}
            {showPreview && (
              <div id="website-preview" className="flex flex-col items-center w-full max-w-full mb-8">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Live Preview</h3>
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
                  <button className={`px-2 py-1 rounded ${previewMode==='desktop' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`} onClick={() => setPreviewMode('desktop')}>Desktop</button>
                  <button className={`px-2 py-1 rounded ${previewMode==='tablet' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`} onClick={() => setPreviewMode('tablet')}>Tablet</button>
                  <button className={`px-2 py-1 rounded ${previewMode==='mobile' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`} onClick={() => setPreviewMode('mobile')}>Mobile</button>
                </div>
              </div>
            )}
            {/* --- End top controls and preview --- */}

            {/* Floating AI Code Assistant */}
            <div className={`fixed z-50 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-600 rounded-2xl shadow-xl transition-all duration-300 ${aiEditorMinimized ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 p-2' : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[300px] sm:w-[350px] md:w-[400px] lg:w-[500px] p-3 sm:p-4 md:p-6 max-h-[80vh] overflow-y-auto'}`}>
              {aiEditorMinimized ? (
                <button
                  onClick={() => setAiEditorMinimized(false)}
                  className="w-full h-full flex items-center justify-center text-purple-400 hover:text-white transition"
                  title="Expand AI Assistant"
                >
                  <SparklesIcon className="h-6 w-6" />
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <SparklesIcon className="h-6 w-6 text-purple-400 mr-2" />
                      <span className="font-bold text-lg text-white">AI Code Assistant</span>
                    </div>
                    <button
                      onClick={() => setAiEditorMinimized(true)}
                      className="text-gray-400 hover:text-white transition"
                      title="Minimize"
                    >
                      −
                    </button>
                  </div>
                  <p className="text-gray-300 mb-3 text-sm">
                    Describe what you want to build and get instant code suggestions powered by AI. 
                    {selectedCode && <span className="text-yellow-400"> Selected code: "{selectedCode.substring(0, 50)}..."</span>}
                  </p>
                  
                  {/* Image Upload Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📷 Upload Image (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelection}
                        className="hidden"
                        id="ai-image-upload"
                      />
                      <label
                        htmlFor="ai-image-upload"
                        className="px-3 py-2 bg-gray-700 text-white text-sm rounded cursor-pointer hover:bg-gray-600 transition"
                      >
                        Choose Image
                      </label>
                      {selectedImage && (
                        <button
                          onClick={clearSelectedImage}
                          className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-32 object-cover rounded border border-gray-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Code Selection Info */}
                  {selectedCode && (
                    <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        <strong>Partial Update Mode:</strong> Only the selected code will be updated.
                        <button 
                          onClick={() => { setSelectedCode(''); setIsPartialUpdate(false); }}
                          className="ml-2 px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        >
                          Clear Selection
                        </button>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <textarea
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="e.g. Create a responsive navbar with smooth animations"
                      rows={3}
                      className="flex-1 border border-gray-600 rounded-lg p-3 text-sm text-white bg-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                      style={{ minHeight: 80 }}
                    />
                    <button
                      onClick={handleEnhancedAIGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="h-20 px-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-60"
                    >
                      {aiLoading ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>

                  {/* Keep/Discard Changes */}
                  {showKeepDiscard && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                      <p className="text-blue-300 text-sm mb-3">
                        <strong>AI Code Applied!</strong> Choose to keep or discard the changes:
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleKeepChanges}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
                        >
                          Keep Changes
                        </button>
                        <button
                          onClick={handleDiscardChanges}
                          className="px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Image Enhancement Modal */}
            {showImagePrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-4">🖼️ Enhance Your Website with Images</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    I found that your website needs some images to look complete. Please provide image links for the following:
                  </p>
                  
                  <div className="space-y-4">
                    {requestedImages.map((imageDesc, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          {imageDesc}
                        </label>
                        <input
                          type="url"
                          value={imageInputs[imageDesc] || ''}
                          onChange={(e) => setImageInputs(prev => ({
                            ...prev,
                            [imageDesc]: e.target.value
                          }))}
                          placeholder="https://example.com/image.jpg"
                          className="w-full border border-gray-600 rounded-lg p-2 text-sm text-white bg-gray-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={applyImagesToCode}
                      disabled={imagePromptLoading || !Object.values(imageInputs).some(url => url.trim())}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imagePromptLoading ? 'Applying...' : 'Apply Images'}
                    </button>
                    <button
                      onClick={() => {
                        setShowImagePrompt(false);
                        setRequestedImages([]);
                        setImageInputs({});
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 transition"
                    >
                      Skip
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Tip: Use free image services like Unsplash, Pexels, or Pixabay for high-quality images.
                  </p>
                </div>
              </div>
            )}
            {/* Templates Section */}
            {/* Removed the main templates section from here */}
            <div className="w-full">
              <div className="mb-2 flex gap-2 items-center flex-wrap text-gray-900 dark:text-white">
                <button className={`px-4 py-2 rounded-t bg-gray-100 dark:bg-gray-800 border-b-2 ${selectedTab==='html' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('html')}>HTML</button>
                <button className={`px-4 py-2 rounded-t bg-gray-100 dark:bg-gray-800 border-b-2 ${selectedTab==='css' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('css')}>CSS</button>
                <button className={`px-4 py-2 rounded-t bg-gray-100 dark:bg-gray-800 border-b-2 ${selectedTab==='js' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('js')}>JavaScript</button>
                <button 
                  type="button" 
                  className="ml-auto px-4 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 transition" 
                  onClick={() => {
                    if (htmlCode.trim()) {
                      analyzeImageRequirements(htmlCode);
                    } else {
                      toast.error('No HTML code to analyze');
                    }
                  }}
                  disabled={imagePromptLoading}
                >
                  {imagePromptLoading ? 'Analyzing...' : '🖼️ Find Images'}
                </button>
              </div>
              
              {/* Code Selection Instructions */}
              <div className="mb-2 p-2 bg-blue-900/20 border border-blue-600 rounded text-blue-300 text-xs">
                <strong>Tip:</strong> Select any code in the editor below and use the AI assistant to update only that specific part.
                <br />
                <strong>Best Practice:</strong> For titles, select only the text content (e.g., "ABC learning") instead of the entire tag.
              </div>
              <div className="w-full h-80 sm:h-96 mb-4 max-w-full">
                {selectedTab === 'html' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="html"
                    language="html"
                    value={htmlCode}
                    onChange={value => setHtmlCode(value || "")}
                    theme="vs-dark"
                    options={{ 
                      fontSize: 16, 
                      minimap: { enabled: false }, 
                      wordWrap: 'on',
                      selectOnLineNumbers: true,
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true
                    }}
                    onMount={(editor) => {
                      editor.onDidChangeCursorSelection((e) => {
                        const selection = e.selection;
                        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
                        
                        // Only process selection if there's actual text selected and it's not empty
                        if (selectedText.trim() && selection && 
                            (selection.startLineNumber !== selection.endLineNumber || 
                             selection.startColumn !== selection.endColumn)) {
                          
                          // Clean up the selected text - remove extra whitespace and newlines
                          const cleanedText = selectedText.trim();
                          
                          // Only process if selection is meaningful (more than just whitespace)
                          if (cleanedText.length > 0) {
                            handleCodeSelection(cleanedText);
                          }
                        } else {
                          // Clear selection if nothing meaningful is selected
                          setSelectedCode('');
                          setIsPartialUpdate(false);
                        }
                      });
                    }}
                  />
                )}
                {selectedTab === 'css' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="css"
                    language="css"
                    value={cssCode}
                    onChange={value => setCssCode(value || "")}
                    theme="vs-dark"
                    options={{ 
                      fontSize: 16, 
                      minimap: { enabled: false }, 
                      wordWrap: 'on',
                      selectOnLineNumbers: true,
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true
                    }}
                    onMount={(editor) => {
                      editor.onDidChangeCursorSelection((e) => {
                        const selection = e.selection;
                        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
                        
                        if (selectedText.trim() && selection && 
                            (selection.startLineNumber !== selection.endLineNumber || 
                             selection.startColumn !== selection.endColumn)) {
                          
                          const cleanedText = selectedText.trim();
                          if (cleanedText.length > 0) {
                            handleCodeSelection(cleanedText);
                          }
                        } else {
                          setSelectedCode('');
                          setIsPartialUpdate(false);
                        }
                      });
                    }}
                  />
                )}
                {selectedTab === 'js' && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="javascript"
                    language="javascript"
                    value={jsCode}
                    onChange={value => setJsCode(value || "")}
                    theme="vs-dark"
                    options={{ 
                      fontSize: 16, 
                      minimap: { enabled: false }, 
                      wordWrap: 'on',
                      selectOnLineNumbers: true,
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true
                    }}
                    onMount={(editor) => {
                      editor.onDidChangeCursorSelection((e) => {
                        const selection = e.selection;
                        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
                        
                        if (selectedText.trim() && selection && 
                            (selection.startLineNumber !== selection.endLineNumber || 
                             selection.startColumn !== selection.endColumn)) {
                          
                          const cleanedText = selectedText.trim();
                          if (cleanedText.length > 0) {
                            handleCodeSelection(cleanedText);
                          }
                        } else {
                          setSelectedCode('');
                          setIsPartialUpdate(false);
                        }
                      });
                    }}
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



      {/* Link Configuration Modal */}
      <Dialog 
        open={linkConfigModalOpen} 
        onClose={() => setLinkConfigModalOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          className: "bg-gray-900 border border-gray-700"
        }}
      >
        <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white border-b border-gray-600 pb-4 bg-gray-800 px-6 py-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.828a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Navigation Link Configuration</h2>
            <p className="text-sm font-normal text-gray-300 mt-1">
              Step {linkConfigStep === 'identify' ? '1' : linkConfigStep === 'configure' ? '2' : '3'} of 3
            </p>
          </div>
        </DialogTitle>
        
        <DialogContent className="pt-6 bg-gray-900">
          {linkConfigStep === 'identify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">
                  🔍 Identifying Clickable Elements
                </h3>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  We've analyzed your HTML and found the following elements that users can click on. 
                  These are perfect candidates for navigation links to other pages on your site.
                </p>
              </div>

              {identifiedElements.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-2xl">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-green-500 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Found {identifiedElements.length} clickable element{identifiedElements.length !== 1 ? 's' : ''}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {identifiedElements.map((element) => (
                      <div key={element.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-500 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            element.type === 'button' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            element.type === 'link' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            {element.type === 'button' && (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                              </svg>
                            )}
                            {element.type === 'link' && (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.828a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                            {element.type === 'clickable' && (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white mb-2 text-lg">
                              {element.text}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {element.tagName.toUpperCase()}{element.className ? ` • ${element.className}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Clickable Elements Found</h4>
                  <p className="text-gray-300 mb-4">
                    We couldn't find any buttons, links, or clickable elements in your HTML content.
                  </p>
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-600 rounded-xl p-6 max-w-md mx-auto shadow-lg">
                    <h5 className="font-semibold text-white mb-3">💡 Add these to your HTML:</h5>
                    <ul className="text-gray-300 text-sm space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <code className="bg-blue-700 px-2 py-1 rounded text-white">&lt;button&gt;</code> elements
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <code className="bg-blue-700 px-2 py-1 rounded text-white">&lt;a&gt;</code> links
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <code className="bg-blue-700 px-2 py-1 rounded text-white">&lt;div&gt;</code> with onclick handlers
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-xl p-6 shadow-xl">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Navigation Links Work
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center group">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <p className="text-white font-medium">Identify clickable elements in your HTML</p>
                  </div>
                  <div className="text-center group">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <p className="text-white font-medium">Map them to specific pages on your site</p>
                  </div>
                  <div className="text-center group">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <p className="text-white font-medium">Automatically update HTML with navigation</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {linkConfigStep === 'configure' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">
                  ⚙️ Configure Navigation Links
                </h3>
                <p className="text-gray-300">
                  Select which page each clickable element should navigate to. This will create a seamless navigation experience for your users.
                </p>
              </div>

              <div className="space-y-4">
                {identifiedElements.map((element) => (
                  <div key={element.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-500 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <h5 className="font-semibold text-white mb-2 text-lg">
                          {element.text}
                        </h5>
                        <p className="text-sm text-gray-300">
                          {element.tagName.toUpperCase()}{element.className ? ` • ${element.className}` : ''}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-white font-medium">Navigate to:</span>
                        <select
                          className="border border-gray-500 rounded-xl px-4 py-3 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg"
                          value={element.targetPageId || ''}
                          onChange={(e) => handleElementMapping(element.id, e.target.value)}
                        >
                          <option value="">Select a page...</option>
                          {publishedPages.filter(p => p.id !== pageId).map(page => (
                            <option key={page.id} value={page.id}>
                              {page.title} (/{page.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-yellow-900 to-orange-900 border border-yellow-600 rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Navigation Preview
                </h4>
                <p className="text-white text-sm">
                  After configuration, your HTML will be automatically updated. For example, a button with text "About Us" 
                  will become <code className="bg-yellow-700 px-2 py-1 rounded text-white font-mono">&lt;a href="/s/{siteSubdomain}?page=about"&gt;About Us&lt;/a&gt;</code>
                </p>
              </div>
            </div>
          )}

          {linkConfigStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">
                  📋 Review Configuration
                </h3>
                <p className="text-gray-300">
                  Review your navigation link configuration before we update your HTML and publish the page.
                </p>
              </div>

              <div className="space-y-4">
                {identifiedElements.filter(el => el.targetPageId).map((element) => {
                  const targetPage = publishedPages.find(p => p.id === element.targetPageId);
                  return (
                    <div key={element.id} className="bg-gradient-to-br from-green-800 to-green-900 border border-green-600 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-white text-lg">
                            {element.text} → {targetPage?.title}
                          </h5>
                          <p className="text-sm text-gray-300">
                            Will navigate to /{targetPage?.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-600 rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-white mb-3">✅ Ready to Update</h4>
                <p className="text-white text-sm">
                  Your HTML will be automatically updated with these navigation links, and then the page will be published. 
                  You can always edit the links later by modifying the HTML directly.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
        
        <DialogActions className="px-6 py-4 border-t border-gray-600 bg-gray-800">
          {linkConfigStep === 'identify' && (
            <>
              <Button onClick={() => setLinkConfigModalOpen(false)} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button 
                onClick={handleProceedToConfigure}
                color="primary" 
                variant="contained"
                disabled={identifiedElements.length === 0}
                startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>}
              >
                Configure Links
              </Button>
            </>
          )}

          {linkConfigStep === 'configure' && (
            <>
              <Button onClick={() => setLinkConfigStep('identify')} color="secondary" variant="outlined">
                Back
              </Button>
              <Button 
                onClick={() => setLinkConfigStep('review')}
                color="primary" 
                variant="contained"
                disabled={identifiedElements.filter(el => el.targetPageId).length === 0}
                startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>}
              >
                Review & Continue
              </Button>
            </>
          )}

          {linkConfigStep === 'review' && (
            <>
              <Button onClick={() => setLinkConfigStep('configure')} color="secondary" variant="outlined">
                Back
              </Button>
              <Button 
                onClick={handleFinalizeAndPublish}
                color="primary" 
                variant="contained"
                disabled={loading}
                startIcon={loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              >
                {loading ? 'Updating & Publishing...' : 'Update HTML & Publish'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Form Modal - Redesigned with step to choose placement */}
      <Dialog open={addFormModalOpen} onClose={() => { setAddFormModalOpen(false); setAddFormStep('choose'); setSelectedFormType(null); }} maxWidth="md" fullWidth
        PaperProps={{ className: 'bg-black text-white border border-gray-800 rounded-2xl' }}>
        <DialogTitle className="flex items-center justify-between text-2xl font-bold text-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <PlusIcon className="h-7 w-7 text-black-400" />
            <span>Add Form to Page</span>
          </div>
          <span className="text-sm text-gray-400">{addFormStep === 'choose' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
        </DialogTitle>
        <DialogContent className="px-6 py-6">
          {addFormStep === 'choose' && (
            <div>
              <p className="text-black-300 mb-6">
                Select a form type. In the next step you can choose where to insert it in your HTML.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => { setSelectedFormType('contact'); setAddFormStep('position'); }}
                  className="group p-5 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors text-left">
                  <div className="p-3 rounded-lg bg-blue-900/40 inline-block mb-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <h3 className="font-semibold text-white">Contact Form</h3>
                  <p className="text-sm text-gray-400">Collect messages and inquiries</p>
                </button>
              </div>
            </div>
          )}
          {addFormStep === 'position' && selectedFormType && (
            <div>
              <p className="text-gray-300 mb-6">Choose where to insert the {selectedFormType} form in your HTML.</p>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                  <input type="radio" name="insert-pos" className="accent-purple-500" checked={insertionPosition==='afterSelection'} onChange={() => setInsertionPosition('afterSelection')} />
                  <div>
                    <div className="text-white font-medium">After selected code (recommended)</div>
                    <div className="text-xs text-gray-400">Select a spot in the HTML editor; the form will be inserted right after it.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                  <input type="radio" name="insert-pos" className="accent-purple-500" checked={insertionPosition==='top'} onChange={() => setInsertionPosition('top')} />
                  <div>
                    <div className="text-white font-medium">At the top of HTML</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer">
                  <input type="radio" name="insert-pos" className="accent-purple-500" checked={insertionPosition==='bottom'} onChange={() => setInsertionPosition('bottom')} />
                  <div>
                    <div className="text-white font-medium">At the bottom of HTML</div>
                  </div>
                </label>
                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="insert-pos" className="mt-1 accent-purple-500" checked={insertionPosition==='selector'} onChange={() => setInsertionPosition('selector')} />
                    <div className="flex-1">
                      <div className="text-white font-medium mb-2">After CSS selector</div>
                      <input value={insertionSelector} onChange={e=>setInsertionSelector(e.target.value)} placeholder="e.g., #hero or .container h2" className="w-full px-3 py-2 rounded-md bg-black border border-gray-800 text-gray-200" />
                      <div className="text-xs text-gray-400 mt-2">We will find the first element that matches and insert the form after it.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-800">
          {addFormStep === 'choose' ? (
            <>
              <Button onClick={() => { setAddFormModalOpen(false); setAddFormStep('choose'); setSelectedFormType(null); }} color="secondary" variant="outlined">Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setAddFormStep('choose')} color="secondary" variant="outlined">Back</Button>
              <Button onClick={() => selectedFormType && insertFormAtPosition(selectedFormType, insertionPosition, insertionSelector)} color="primary" variant="contained">Insert Form</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
} 