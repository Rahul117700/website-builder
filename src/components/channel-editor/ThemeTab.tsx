'use client';

import { useState } from 'react';
import { SwatchIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ThemeTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function ThemeTab({ channel, onUpdate }: ThemeTabProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const template = channel.template || {};
  const theme = (template.defaultTheme as any) || {};
  const customTheme = channel.customizations?.theme || {};

  const getCurrentColor = (key: string) => {
    return customTheme[key] || theme.colors?.[key] || '#6366f1';
  };

  const updateThemeColor = (key: string, value: string) => {
    const newTheme = {
      ...customTheme,
      [key]: value,
    };
    onUpdate({
      customizations: {
        ...channel.customizations,
        theme: newTheme,
      },
    });
  };

  const fonts = [
    'Inter',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Lato',
    'Playfair Display',
    'Source Sans Pro',
    'Space Grotesk',
  ];

  const popularColors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Black', value: '#000000' },
  ];

  const ColorInput = ({ label, colorKey, description }: { label: string; colorKey: string; description?: string }) => (
    <div>
      <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(showColorPicker === colorKey ? null : colorKey)}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors"
            style={{ backgroundColor: getCurrentColor(colorKey) }}
          />
          {showColorPicker === colorKey && (
            <div className="absolute top-full left-0 mt-2 bg-[#1e1e1e] rounded-lg shadow-xl border border-white/10 p-3 z-50 w-64">
              <div className="mb-3">
                <input
                  type="color"
                  value={getCurrentColor(colorKey)}
                  onChange={(e) => updateThemeColor(colorKey, e.target.value)}
                  className="w-full h-32 rounded cursor-pointer"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Hex</label>
                <input
                  type="text"
                  value={getCurrentColor(colorKey)}
                  onChange={(e) => updateThemeColor(colorKey, e.target.value)}
                  className="w-full px-2 py-1 border border-white/10 rounded text-sm bg-white/5 text-white"
                  placeholder="#000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Popular Colors</label>
                <div className="grid grid-cols-4 gap-2">
                  {popularColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateThemeColor(colorKey, color.value)}
                      className="w-full aspect-square rounded border-2 border-gray-300 hover:border-gray-900 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={getCurrentColor(colorKey)}
            onChange={(e) => updateThemeColor(colorKey, e.target.value)}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono text-white bg-white/5"
            placeholder="#000000"
          />
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Current Template</span>
          <SwatchIcon className="h-4 w-4 text-gray-600" />
        </div>
        <p className="text-sm font-medium text-white">{template.name || 'Default'}</p>
        <p className="text-xs text-gray-500 mt-1">{template.category || 'General'}</p>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
          <SparklesIcon className="h-4 w-4" />
          Colors
        </h3>

        <ColorInput
          label="Primary Color"
          colorKey="primary"
          description="Main brand color for buttons and accents"
        />

        <ColorInput
          label="Secondary Color"
          colorKey="secondary"
          description="Secondary brand color"
        />

        <ColorInput
          label="Background"
          colorKey="background"
          description="Page background color"
        />

        <ColorInput
          label="Text Color"
          colorKey="text"
          description="Main text color"
        />
      </div>

      {/* Fonts */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300">Typography</h3>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Heading Font
          </label>
          <select
            value={customTheme.headingFont || theme.fonts?.heading || 'Inter'}
            onChange={(e) => updateThemeColor('headingFont', e.target.value)}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-white bg-white/5 [&>option]:bg-[#1e1e1e]"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
            Body Font
          </label>
          <select
            value={customTheme.bodyFont || theme.fonts?.body || 'Inter'}
            onChange={(e) => updateThemeColor('bodyFont', e.target.value)}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-white bg-white/5 [&>option]:bg-[#1e1e1e]"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Spacing
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Compact</span>
          <input
            type="range"
            min="1"
            max="4"
            step="0.5"
            value={parseFloat(customTheme.spacing || theme.spacing || '2')}
            onChange={(e) => updateThemeColor('spacing', e.target.value + 'rem')}
            className="flex-1"
          />
          <span className="text-xs text-gray-500">Spacious</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {customTheme.spacing || theme.spacing || '2rem'}
        </p>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
          Border Radius
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Square</span>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.125"
            value={parseFloat(customTheme.borderRadius || theme.borderRadius || '0.5')}
            onChange={(e) => updateThemeColor('borderRadius', e.target.value + 'rem')}
            className="flex-1"
          />
          <span className="text-xs text-gray-500">Rounded</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {customTheme.borderRadius || theme.borderRadius || '0.5rem'}
        </p>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onUpdate({
          customizations: {
            ...channel.customizations,
            theme: {},
          },
        })}
        className="w-full px-4 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
      >
        Reset to Template Defaults
      </button>

      {/* Tip */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-xs font-medium text-indigo-300 mb-1">🎨 Design Tip</p>
        <p className="text-xs text-indigo-400">
          Stick to 2-3 colors for a cohesive look. Use your primary color for CTAs and important elements!
        </p>
      </div>
    </div>
  );
}

