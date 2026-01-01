'use client';

import { Bars3Icon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LayoutTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function LayoutTab({ channel, onUpdate }: LayoutTabProps) {
  const sections = [
    { id: 'hero', name: 'Hero Section', description: 'Main banner with channel name' },
    { id: 'about', name: 'About Section', description: 'Welcome message and introduction' },
    { id: 'products', name: 'Products Grid', description: 'Display your products' },
    { id: 'footer', name: 'Footer', description: 'Copyright and links' },
  ];

  const layout = channel.customizations?.layout || {};
  const visibleSections = layout.visibleSections || sections.map(s => s.id);

  const toggleSection = (sectionId: string) => {
    const newVisible = visibleSections.includes(sectionId)
      ? visibleSections.filter((id: string) => id !== sectionId)
      : [...visibleSections, sectionId];

    onUpdate({
      customizations: {
        ...channel.customizations,
        layout: {
          ...layout,
          visibleSections: newVisible,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Sections</h3>
        <p className="text-xs text-gray-600 mb-4">
          Show or hide sections on your channel. Drag to reorder (coming soon).
        </p>

        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Bars3Icon className="h-5 w-5 text-gray-400 cursor-move" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{section.name}</p>
                <p className="text-xs text-gray-600">{section.description}</p>
              </div>
              <button
                onClick={() => toggleSection(section.id)}
                className="p-2 hover:bg-white rounded transition-colors"
                title={visibleSections.includes(section.id) ? 'Hide section' : 'Show section'}
              >
                {visibleSections.includes(section.id) ? (
                  <EyeIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Max Width */}
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
          Max Content Width
        </label>
        <select
          value={layout.maxWidth || '1200px'}
          onChange={(e) => onUpdate({
            customizations: {
              ...channel.customizations,
              layout: { ...layout, maxWidth: e.target.value },
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
        >
          <option value="1200px">1200px (Comfortable)</option>
          <option value="1400px">1400px (Wide)</option>
          <option value="1600px">1600px (Full Width)</option>
        </select>
      </div>

      {/* Tip */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs font-medium text-green-900 mb-1">📐 Layout Tip</p>
        <p className="text-xs text-green-800">
          Keep essential sections visible. You can always toggle them on/off for different occasions!
        </p>
      </div>
    </div>
  );
}

