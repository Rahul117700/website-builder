'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { gsap } from 'gsap';
import { 
  PlusIcon, 
  EyeIcon, 
  CodeBracketIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

interface Component {
  id: string;
  type: string;
  name: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: any;
}

interface Site {
  id: string;
  name: string;
  components: Component[];
  settings: any;
}

const componentLibrary = [
  {
    type: 'hero',
    name: 'Hero Section',
    icon: '🎯',
    defaultContent: {
      title: 'Welcome to Our Site',
      subtitle: 'Create something amazing',
      buttonText: 'Get Started',
      buttonLink: '#',
      backgroundImage: '/api/placeholder/1200/600'
    }
  },
  {
    type: 'about',
    name: 'About Section',
    icon: 'ℹ️',
    defaultContent: {
      title: 'About Us',
      description: 'We are passionate about creating amazing experiences.',
      image: '/api/placeholder/400/300'
    }
  },
  {
    type: 'services',
    name: 'Services Section',
    icon: '🛠️',
    defaultContent: {
      title: 'Our Services',
      services: [
        { name: 'Service 1', description: 'Description for service 1', icon: '🚀' },
        { name: 'Service 2', description: 'Description for service 2', icon: '💡' },
        { name: 'Service 3', description: 'Description for service 3', icon: '🎨' }
      ]
    }
  },
  {
    type: 'contact',
    name: 'Contact Section',
    icon: '📞',
    defaultContent: {
      title: 'Get In Touch',
      email: 'contact@example.com',
      phone: '+1 234 567 890',
      address: '123 Main St, City, Country'
    }
  },
  {
    type: 'gallery',
    name: 'Gallery Section',
    icon: '🖼️',
    defaultContent: {
      title: 'Our Gallery',
      images: [
        '/api/placeholder/300/200',
        '/api/placeholder/300/200',
        '/api/placeholder/300/200'
      ]
    }
  },
  {
    type: 'testimonials',
    name: 'Testimonials Section',
    icon: '💬',
    defaultContent: {
      title: 'What People Say',
      testimonials: [
        { name: 'John Doe', role: 'CEO', content: 'Amazing service!', avatar: '/api/placeholder/60/60' },
        { name: 'Jane Smith', role: 'Designer', content: 'Highly recommended!', avatar: '/api/placeholder/60/60' }
      ]
    }
  }
];

export default function SiteEditor() {
  const searchParams = useSearchParams();
  const siteId = searchParams?.get('siteId');
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const componentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

  useEffect(() => {
    if (site) {
      animatePageLoad();
    }
  }, [site]);

  const fetchSiteData = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`);
      if (response.ok) {
        const siteData = await response.json();
        setSite(siteData);
      } else {
        console.error('Failed to fetch site data');
      }
    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  };

  const animatePageLoad = () => {
    gsap.fromTo('.editor-header', 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
    
    gsap.fromTo('.component-library', 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
    );
    
    gsap.fromTo('.canvas-area', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power3.out' }
    );
  };

  const addComponent = (componentType: string) => {
    if (!site) return;

    const componentTemplate = componentLibrary.find(c => c.type === componentType);
    if (!componentTemplate) return;

    const newComponent: Component = {
      id: `comp_${Date.now()}`,
      type: componentType,
      name: componentTemplate.name,
      content: { ...componentTemplate.defaultContent },
      position: { x: 50, y: 50 + (site.components.length * 100) },
      size: { width: 400, height: 300 },
      settings: {}
    };

    const updatedSite = {
      ...site,
      components: [...site.components, newComponent]
    };

    setSite(updatedSite);
    saveSite(updatedSite);
    setShowComponentLibrary(false);
  };

  const updateComponent = (componentId: string, updates: Partial<Component>) => {
    if (!site) return;

    const updatedComponents = site.components.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );

    const updatedSite = { ...site, components: updatedComponents };
    setSite(updatedSite);
    saveSite(updatedSite);
  };

  const deleteComponent = (componentId: string) => {
    if (!site) return;

    const updatedComponents = site.components.filter(comp => comp.id !== componentId);
    const updatedSite = { ...site, components: updatedComponents };
    
    setSite(updatedSite);
    saveSite(updatedSite);
    setSelectedComponent(null);
  };

  const saveSite = async (siteData: Site) => {
    try {
      await fetch(`/api/sites/${siteId}/components`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components: siteData.components })
      });
    } catch (error) {
      console.error('Error saving site:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, component: Component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData('component');
    if (componentData) {
      const component: Component = JSON.parse(componentData);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        updateComponent(component.id, { position: { x, y } });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderComponent = (component: Component) => {
    const componentStyle = {
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      border: selectedComponent?.id === component.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'move',
      zIndex: selectedComponent?.id === component.id ? 10 : 1
    };

    return (
              <div
          key={component.id}
          ref={(el) => { componentRefs.current[component.id] = el; }}
          style={componentStyle}
        onClick={() => setSelectedComponent(component)}
        draggable
        onDragStart={(e) => handleDragStart(e, component)}
        className="component-wrapper shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <div className="component-header bg-gray-50 p-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{component.name}</span>
          <div className="flex space-x-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <Cog6ToothIcon className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
              className="p-1 hover:bg-red-100 rounded"
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
        
        <div className="component-content p-4">
          {component.type === 'hero' && (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{component.content.title}</h2>
              <p className="text-gray-600 mb-4">{component.content.subtitle}</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {component.content.buttonText}
              </button>
            </div>
          )}
          
          {component.type === 'about' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{component.content.title}</h3>
              <p className="text-gray-600 text-sm">{component.content.description}</p>
            </div>
          )}
          
          {component.type === 'services' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{component.content.title}</h3>
              <div className="space-y-2">
                {component.content.services.map((service: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-lg">{service.icon}</span>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {component.type === 'contact' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{component.content.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📧 {component.content.email}</p>
                <p>📞 {component.content.phone}</p>
                <p>📍 {component.content.address}</p>
              </div>
            </div>
          )}
          
          {component.type === 'gallery' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{component.content.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {component.content.images.map((image: string, index: number) => (
                  <div key={index} className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {component.type === 'testimonials' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{component.content.title}</h3>
              <div className="space-y-2">
                {component.content.testimonials.map((testimonial: any, index: number) => (
                  <div key={index} className="text-sm">
                    <p className="text-gray-600 italic">&quot;{testimonial.content}&quot;</p>
                    <p className="font-medium text-gray-800">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!site) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Site Not Found</h1>
          <p className="text-gray-600">The requested site could not be found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Editor Header */}
        <div className="editor-header bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Editor</h1>
              <p className="text-gray-600">Editing: {site.name}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  previewMode 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <EyeIcon className="w-5 h-5" />
                <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
              </button>
              
              <button
                onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Component</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Component Library Sidebar */}
          {showComponentLibrary && (
            <div className="component-library w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Library</h3>
              <div className="space-y-3">
                {componentLibrary.map((component) => (
                  <div
                    key={component.type}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                    onClick={() => addComponent(component.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{component.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{component.name}</h4>
                        <p className="text-sm text-gray-600">Drag to add to your site</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 flex">
            <div className="canvas-area flex-1 p-6 overflow-auto">
              <div
                ref={canvasRef}
                className="canvas bg-white rounded-lg shadow-lg min-h-full relative"
                style={{ width: '100%', height: '100%' }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {site.components.map(renderComponent)}
                
                {site.components.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <CursorArrowRaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Site</h3>
                      <p className="text-gray-600 mb-4">Add components from the library to get started</p>
                      <button
                        onClick={() => setShowComponentLibrary(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Open Component Library
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Component Properties Panel */}
            {selectedComponent && (
              <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={selectedComponent.name}
                      onChange={(e) => updateComponent(selectedComponent.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                    <input
                      type="number"
                      value={selectedComponent.position.x}
                      onChange={(e) => updateComponent(selectedComponent.id, { 
                        position: { ...selectedComponent.position, x: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                    <input
                      type="number"
                      value={selectedComponent.position.y}
                      onChange={(e) => updateComponent(selectedComponent.id, { 
                        position: { ...selectedComponent.position, y: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <input
                      type="number"
                      value={selectedComponent.size.width}
                      onChange={(e) => updateComponent(selectedComponent.id, { 
                        size: { ...selectedComponent.size, width: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                    <input
                      type="number"
                      value={selectedComponent.size.height}
                      onChange={(e) => updateComponent(selectedComponent.id, { 
                        size: { ...selectedComponent.size, height: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
