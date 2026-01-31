'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    XMarkIcon,
    PlusIcon,
    CheckIcon,
    FolderPlusIcon,
    LockClosedIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Playlist {
    id: string;
    name: string;
    isPublic: boolean;
    items: { productId: string }[];
}

interface SaveToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

export default function SaveToPlaylistModal({ isOpen, onClose, productId }: SaveToPlaylistModalProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/playlists');
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data.playlists || []);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
            toast.error('Failed to load playlists');
        } finally {
            setLoading(false);
        }
    };

    const toggleProductInPlaylist = async (playlistId: string, isInPlaylist: boolean) => {
        try {
            const method = isInPlaylist ? 'DELETE' : 'POST';
            const url = `/api/user/playlists/${playlistId}/items${isInPlaylist ? `?productId=${productId}` : ''}`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: isInPlaylist ? undefined : JSON.stringify({ productId })
            });

            if (response.ok) {
                toast.success(isInPlaylist ? 'Removed from playlist' : 'Added to playlist');
                fetchPlaylists(); // Refresh state
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update playlist');
            }
        } catch (error) {
            console.error('Error updating playlist item:', error);
            toast.error('Something went wrong');
        }
    };

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        try {
            setCreating(true);
            const response = await fetch('/api/user/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPlaylistName.trim(),
                    isPublic
                })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Playlist created');
                setNewPlaylistName('');
                // Automatically add the product to the newly created playlist
                await toggleProductInPlaylist(data.playlist.id, false);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create playlist');
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            toast.error('Failed to create playlist');
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Save to...</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-sm text-gray-500 font-medium">Loading playlists...</p>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="py-8 text-center px-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <FolderPlusIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">No playlists yet. Create one below to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {playlists.map((playlist) => {
                                const isInPlaylist = playlist.items?.some(item => item.productId === productId);
                                return (
                                    <button
                                        key={playlist.id}
                                        onClick={() => toggleProductInPlaylist(playlist.id, isInPlaylist)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-all group"
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isInPlaylist ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'
                                            }`}>
                                            {isInPlaylist && <CheckIcon className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-bold text-gray-900">{playlist.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {playlist.isPublic ? (
                                                    <GlobeAltIcon className="w-3 h-3 text-gray-400" />
                                                ) : (
                                                    <LockClosedIcon className="w-3 h-3 text-gray-400" />
                                                )}
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                    {playlist.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer - Create New */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <form onSubmit={handleCreatePlaylist} className="space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Create new playlist..."
                                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={creating || !newPlaylistName.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</span>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(false)}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${!isPublic ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Private
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(true)}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${isPublic ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Public
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
