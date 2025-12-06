import React, { useState } from 'react';
import { PaintBrushIcon, ArrowUpTrayIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DesignTabProps {
    customizations: any;
    setCustomizations: (customizations: any) => void;
    colorPresets: Array<{ name: string; primary: string; secondary: string }>;
}

export default function DesignTab({
    customizations,
    setCustomizations,
    colorPresets
}: DesignTabProps) {
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'previewImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setCustomizations({ ...customizations, [field]: data.url });
                toast.success('Image uploaded successfully!');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="space-y-8 pb-8" data-tour="design-tab">
            {/* 1. Color Theme Selection */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <PaintBrushIcon className="w-4 h-4 text-purple-600" />
                        Color Theme
                    </h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {colorPresets.length} Presets
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {colorPresets.map((preset) => {
                        const isActive = customizations.primaryColor === preset.primary;
                        return (
                            <button
                                key={preset.name}
                                onClick={() => setCustomizations({
                                    ...customizations,
                                    primaryColor: preset.primary,
                                    secondaryColor: preset.secondary
                                })}
                                className={`group relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${isActive
                                    ? 'border-purple-600 bg-purple-50 shadow-sm'
                                    : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex -space-x-2 mr-4 shrink-0">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm z-10"
                                        style={{ backgroundColor: preset.primary }}
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: preset.secondary }}
                                    />
                                </div>

                                <span className={`text-sm font-medium ${isActive ? 'text-purple-900' : 'text-gray-700'}`}>
                                    {preset.name}
                                </span>

                                {isActive && (
                                    <div className="absolute right-3 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 2. Custom Color Tweaks */}
            <section className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Custom Colors</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-gray-500 mb-1.5 block">Primary</span>
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 focus-within:border-purple-500 transition-colors">
                            <input
                                type="color"
                                value={customizations.primaryColor}
                                onChange={(e) => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                                className="h-8 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                            />
                            <input
                                type="text"
                                value={customizations.primaryColor}
                                onChange={(e) => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                                className="w-full text-xs font-mono text-gray-700 outline-none uppercase bg-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 mb-1.5 block">Secondary</span>
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 focus-within:border-purple-500 transition-colors">
                            <input
                                type="color"
                                value={customizations.secondaryColor}
                                onChange={(e) => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                                className="h-8 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                            />
                            <input
                                type="text"
                                value={customizations.secondaryColor}
                                onChange={(e) => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                                className="w-full text-xs font-mono text-gray-700 outline-none uppercase bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Button Style */}
            <section>
                <label className="block text-sm font-bold text-gray-900 mb-4">Button Style</label>
                <div className="grid grid-cols-3 gap-3">
                    {['rounded', 'pill', 'square'].map((style) => {
                        const isActive = customizations.buttonStyle === style;
                        const radiusClass = style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-lg' : 'rounded-none';

                        return (
                            <button
                                key={style}
                                onClick={() => setCustomizations({ ...customizations, buttonStyle: style })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${isActive
                                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div
                                    className={`w-full h-8 bg-current opacity-20 ${radiusClass}`}
                                />
                                <span className="text-xs font-medium capitalize">{style}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 4. Cover Image */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-gray-900">Cover Image</label>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                </div>

                {customizations.previewImage ? (
                    <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <img
                            src={customizations.previewImage}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                onClick={() => document.getElementById('preview-image-upload')?.click()}
                                className="p-2 bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-full backdrop-blur-sm transition-all text-xs font-medium"
                                title="Change Image"
                            >
                                <ArrowUpTrayIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCustomizations({ ...customizations, previewImage: '' })}
                                className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all"
                                title="Remove Image"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="group relative border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer text-center"
                        onClick={() => document.getElementById('preview-image-upload')?.click()}
                    >
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform group-hover:bg-purple-100">
                            {uploadingImage ? (
                                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                            ) : (
                                <PhotoIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
                            )}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">Click to upload</h4>
                        <p className="text-xs text-gray-500 mt-1">1200x630px recommended</p>
                    </div>
                )}

                <input
                    type="file"
                    id="preview-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'previewImage')}
                    disabled={uploadingImage}
                />
            </section>
        </div>
    );
}

