'use client';

import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlaylistCreated?: (playlist: any) => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onPlaylistCreated }: CreatePlaylistModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/user/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    isPublic
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Playlist created successfully!');
                if (onPlaylistCreated) {
                    onPlaylistCreated(data.playlist);
                }
                onClose();
                setName('');
                setDescription('');
                setIsPublic(false);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create playlist');
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                                <PlusIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Create New Playlist</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Playlist Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter a name for your playlist"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-medium transition-all outline-none"
                                maxLength={50}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this playlist about?"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-medium transition-all outline-none resize-none h-24"
                                maxLength={200}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                {isPublic ? (
                                    <GlobeAltIcon className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <LockClosedIcon className="w-5 h-5 text-gray-500" />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {isPublic ? 'Public' : 'Private'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                        {isPublic ? 'Anyone can view' : 'Only you can view'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ring-2 ring-transparent focus:ring-indigo-500 ring-offset-2 ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create Playlist'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
