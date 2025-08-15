'use client';

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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

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
    // If no blocks, treat the whole string as the appropriate type
    if (!html && !css && !js) {
      // For partial updates, we'll use the current tab type
      const cleanCode = aiCode.trim();
      // Default to HTML if no specific type is detected
      html = cleanCode;
    }
  }
  return { html, css, js };
}

export default function TemplateAdminPanel({ heading = 'Template Management', description = 'Create, edit, approve, and delete templates for the marketplace.', search = '', setSearch, page = 1, setPage, templatesPerPage = 10 }: TemplateAdminPanelProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const requiredPages = ['home', 'about', 'contact', 'services', 'product'];
  const emptyPage = { html: '', css: '', js: '' };
  
  // Initialize form with localStorage or default values
  const getInitialForm = () => {
    try {
      const saved = localStorage.getItem('template-form-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all required pages exist
        const pages = requiredPages.reduce((acc, page) => ({ 
          ...acc, 
          [page]: parsed.pages?.[page] || { html: '', css: '', js: '' } 
        }), {});
        return { ...parsed, pages };
      }
    } catch (error) {
      console.error('Error loading form draft:', error);
    }
    return {
      name: '',
      category: '',
      price: 0,
      description: '',
      preview: '',
      pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {})
    };
  };
  
  const [form, setForm] = useState<TemplateForm>(getInitialForm());
  const [editing, setEditing] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedTab, setSelectedTab] = useState<'html'|'css'|'js'>('html');
  const [showPreview, setShowPreview] = useState(true); // Always visible by default
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCode, setAiCode] = useState<any>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // New state for AI functionality
  const [selectedCode, setSelectedCode] = useState('');
  const [isPartialUpdate, setIsPartialUpdate] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{html: string, css: string, js: string} | null>(null);
  const [originalCode, setOriginalCode] = useState<{html: string, css: string, js: string} | null>(null);
  const [showKeepDiscard, setShowKeepDiscard] = useState(false);
  const [aiEditorMinimized, setAiEditorMinimized] = useState(false);
  
  // New state for image enhancement
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [requestedImages, setRequestedImages] = useState<string[]>([]);
  const [imageInputs, setImageInputs] = useState<{[key: string]: string}>({});
  const [imagePromptLoading, setImagePromptLoading] = useState(false);
  
  // New state for image input to AI
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      toast.error('');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTemplates(); }, []);
  
  // Save form draft to localStorage whenever form changes
  useEffect(() => {
    try {
      // Only save if form has some content (not completely empty)
      const hasContent = form.name || form.description || 
        Object.values(form.pages).some(page => page.html || page.css || page.js);
      
      if (hasContent && !editing) {
        localStorage.setItem('template-form-draft', JSON.stringify(form));
      }
    } catch (error) {
      console.error('Error saving form draft:', error);
    }
  }, [form, editing]);

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
          // Apply the enhanced code with images to current page
          setForm(prevForm => ({
            ...prevForm,
            pages: {
              ...prevForm.pages,
              [selectedPage]: {
                html: data.html,
                css: data.css,
                js: data.js || prevForm.pages[selectedPage]?.js || ''
              }
            }
          }));
          
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
          toast('Your website looks complete! No additional images needed.');
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
      const currentPageCode = form.pages?.[selectedPage] || { html: '', css: '', js: '' };
      
      const res = await fetch('/api/apply-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          htmlCode: currentPageCode.html,
          cssCode: currentPageCode.css,
          imageLinks: imageInputs
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({
          ...f,
          pages: {
            ...f.pages,
            [selectedPage]: {
              ...f.pages[selectedPage],
              html: data.html || currentPageCode.html,
              css: data.css || currentPageCode.css
            }
          }
        }));
        
        setShowImagePrompt(false);
        setRequestedImages([]);
        setImageInputs({});
        toast.success('Images applied to your website!');
        
        // Auto-scroll to preview
        setTimeout(() => {
          const previewElement = document.getElementById('template-preview');
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
        // Clear localStorage draft after successful submission
        localStorage.removeItem('template-form-draft');
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

  // Enhanced AI Code Assistant logic
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiCode('');
    
    // Store original code before making changes
    const currentPageCode = form.pages?.[selectedPage] || { html: '', css: '', js: '' };
    setOriginalCode(currentPageCode);
    
    try {
      const currentCode = `${currentPageCode.html}\n\n${currentPageCode.css}\n\n${currentPageCode.js}`;
      
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
           const currentTabCode = currentPageCode[selectedTab] || '';
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
             
             setForm(f => ({
               ...f,
               pages: {
                 ...f.pages,
                 [selectedPage]: {
                   ...f.pages[selectedPage],
                   [selectedTab]: updatedTabCode
                 }
               }
             }));
           }
         } else {
          // For full updates, apply all code blocks
          setForm(f => ({
            ...f,
            pages: {
              ...f.pages,
              [selectedPage]: {
                ...f.pages[selectedPage],
                ...codeBlocks
              }
            }
          }));
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
          const previewElement = document.getElementById('template-preview');
          if (previewElement) {
            previewElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500); // Small delay to ensure DOM updates
        
        // For full updates, analyze for image requirements
        if (!isPartialUpdate) {
          setTimeout(() => {
            // Get the latest HTML from the applied code blocks
            const htmlToAnalyze = codeBlocks.html || form.pages?.[selectedPage]?.html || '';
            if (htmlToAnalyze.trim()) {
                          console.log('Auto-applying images from Unsplash...');
            autoApplyImages(htmlToAnalyze, codeBlocks.css || form.pages?.[selectedPage]?.css || '');
            }
          }, 1500);
        }
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

  // Handle keep changes
  const handleKeepChanges = () => {
    setPendingChanges(null);
    setOriginalCode(null);
    setShowKeepDiscard(false);
    setSelectedCode('');
    setIsPartialUpdate(false);
    toast.success('Changes kept successfully!');
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    // Revert to original code
    if (originalCode) {
      setForm(f => ({
        ...f,
        pages: {
          ...f.pages,
          [selectedPage]: {
            ...f.pages[selectedPage],
            ...originalCode
          }
        }
      }));
    }
    setPendingChanges(null);
    setOriginalCode(null);
    setShowKeepDiscard(false);
    setSelectedCode('');
    setIsPartialUpdate(false);
    toast('Changes discarded.');
  };

  // Handle code selection for partial updates
  const handleCodeSelection = (selectedText: string) => {
    if (selectedText.trim()) {
      setSelectedCode(selectedText);
      setIsPartialUpdate(true);
      toast.success('Code selected for AI update. Your prompt will only affect this selected code.');
    }
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
    <div className="w-full max-w-5xl mx-auto bg-black border-2 border-gray-700 shadow-xl rounded-2xl p-8 mb-12">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">{heading}</h1>
          <p className="text-base text-gray-300 opacity-80">{description}</p>
        </div>
        {/* Draft management */}
        <div className="flex gap-2 items-center">
          {typeof window !== 'undefined' && localStorage.getItem('template-form-draft') && (
            <>
              <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-600">
                💾 Draft saved
              </span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('template-form-draft');
                  setForm({
                    name: '',
                    category: '',
                    price: 0,
                    description: '',
                    preview: '',
                    pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {})
                  });
                  toast.success('Draft cleared!');
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Clear Draft
              </button>
            </>
          )}
        </div>
      </div>
      
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
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="h-20 px-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-60 mt-2 sm:mt-0 flex items-center gap-2"
                >
                 {aiLoading ? (
                   <>
                     <LoadingSpinner size="sm" color="white" />
                     Generating...
                   </>
                 ) : (
                   'Generate Code'
                 )}
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
      
      <div className="flex flex-col gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 bg-gray-900 p-6 rounded-xl shadow border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-white">Name</label>
              <input className="input-field w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="font-semibold text-white">Category</label>
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
              <label className="font-semibold text-white">Price (INR)</label>
              <input type="number" className="input-field w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} min={0} required />
            </div>
            <div>
              <label className="font-semibold text-white">Preview Image</label>
              <input
                type="file"
                accept="image/*"
                className="input-field w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2"
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
              <label className="font-semibold text-white">Description</label>
              <textarea className="input-field w-full text-white bg-gray-800 border border-gray-600 rounded px-3 py-2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          
          {/* Tabbed Monaco Editor for HTML/CSS/JS */}
          <div className="w-full">
            <div className="mb-2 flex gap-2 items-center flex-wrap text-white">
              {requiredPages.map(page => (
                <button type="button" key={page} className={`px-4 py-2 rounded-t bg-gray-800 border-b-2 ${selectedPage===page ? 'border-yellow-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedPage(page)}>{page.charAt(0).toUpperCase()+page.slice(1)}</button>
              ))}
              <span className="mx-2">|</span>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-800 border-b-2 ${selectedTab==='html' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('html')}>HTML</button>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-800 border-b-2 ${selectedTab==='css' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('css')}>CSS</button>
              <button type="button" className={`px-4 py-2 rounded-t bg-gray-800 border-b-2 ${selectedTab==='js' ? 'border-blue-500 font-bold' : 'border-transparent'}`} onClick={() => setSelectedTab('js')}>JavaScript</button>
              <button type="button" className="ml-auto px-4 py-2 rounded bg-yellow-100 text-yellow-800 font-bold hover:bg-yellow-200 transition" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Hide Preview' : 'Show Preview'}</button>
              <button 
                type="button" 
                className="px-4 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 transition" 
                onClick={() => {
                  const currentPageCode = form.pages?.[selectedPage] || { html: '', css: '', js: '' };
                  if (currentPageCode.html.trim()) {
                    analyzeImageRequirements(currentPageCode.html);
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
              <strong>Best Practice:</strong> For titles, select only the text content (e.g., "SkillHive - Online Learning") instead of the entire tag.
            </div>
            
            <div className="w-full h-80 sm:h-96 mb-4 max-w-full">
                              <MonacoEditor
                  height="100%"
                  defaultLanguage={selectedTab}
                  language={selectedTab}
                  value={(form.pages?.[selectedPage]?.[selectedTab]) ?? ''}
                  onChange={value => setForm(f => ({ ...f, pages: { ...f.pages, [selectedPage]: { ...f.pages[selectedPage], [selectedTab]: value || '' } } }))}
                  theme="vs"
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
            </div>
            
            {/* Always visible preview */}
            {showPreview && (
              <div id="template-preview" className="w-full border rounded bg-gray-50 my-4" style={{ minHeight: 300 }}>
                <iframe
                  key={`${selectedPage}-${pageObj.html.length}-${pageObj.css.length}-${pageObj.js.length}`}
                  title="Live Preview"
                  srcDoc={previewDoc}
                  style={{ width: '100%', height: 400, border: 'none', background: 'white' }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn-primary px-5 py-2 rounded bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition flex items-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="primary" />
                  {editing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                `${editing ? 'Update' : 'Create'} Template`
              )}
            </button>
            {editing && <button type="button" className="btn-secondary px-5 py-2 rounded bg-gray-600 text-white font-bold shadow hover:bg-gray-700 transition" onClick={() => { 
              setEditing(null); 
              localStorage.removeItem('template-form-draft');
              setForm({ name: '', category: '', price: 0, description: '', preview: '', pages: requiredPages.reduce((acc, page) => ({ ...acc, [page]: { html: '', css: '', js: '' } }), {}) }); 
            }}>Cancel</button>}
          </div>
        </form>
      </div>
      
      {/* Table Section */}
      <div className="w-full bg-gray-900 p-6 rounded-xl shadow border border-gray-700 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">All Templates</h2>
            {setSearch && (
              <input
                type="text"
                placeholder="Search templates..."
                className="border rounded px-3 py-2 text-white bg-gray-800 border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                value={search}
                onChange={e => { setSearch(e.target.value); if (setPage) setPage(1); }}
                style={{ minWidth: 200 }}
              />
            )}
          </div>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-white">Loading templates...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 text-left text-white">Name</th>
                    <th className="p-2 text-left text-white">Category</th>
                    <th className="p-2 text-left text-white">Price</th>
                    <th className="p-2 text-left text-white">Status</th>
                    <th className="p-2 text-left text-white">Created By</th>
                    <th className="p-2 text-left text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTemplates.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-gray-400">No templates found.</td></tr>
                  ) : paginatedTemplates.map(tpl => (
                    <tr key={tpl.id} className="border-b border-gray-700 hover:bg-gray-800 transition group">
                      <td className="p-2 font-bold text-white">{tpl.name}</td>
                      <td className="p-2 text-gray-300">{tpl.category}</td>
                      <td className="p-2 text-gray-300">₹{tpl.price}</td>
                      <td className="p-2">
                        {tpl.approved ? <span className="inline-flex items-center gap-1 text-green-400 font-bold"><CheckCircleIcon fontSize="small" /> Approved</span> : <span className="text-yellow-400 font-bold">Pending</span>}
                      </td>
                      <td className="p-2 text-gray-300">{tpl.createdBy}</td>
                      <td className="p-2 flex gap-2">
                        <button className="px-2 py-1 rounded bg-blue-900/20 text-blue-400 font-bold hover:bg-blue-900/40 transition flex items-center gap-1" onClick={() => handleEdit(tpl)} title="Edit"><EditIcon fontSize="small" /></button>
                        {!tpl.approved && <button className="px-2 py-1 rounded bg-green-900/20 text-green-400 font-bold hover:bg-green-900/40 transition flex items-center gap-1" onClick={() => handleApprove(tpl.id)} title="Approve"><CheckCircleIcon fontSize="small" /></button>}
                        <button className="px-2 py-1 rounded bg-red-900/20 text-red-400 font-bold hover:bg-red-900/40 transition flex items-center gap-1" onClick={() => handleDelete(tpl.id)} title="Delete"><DeleteIcon fontSize="small" /></button>
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