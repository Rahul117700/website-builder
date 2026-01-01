'use client';

import { XMarkIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

// Create Playlist Modal Component
export function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreate,
  name,
  setName,
  description,
  setDescription,
  primaryColor,
  textColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  primaryColor: string;
  textColor: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>
              Create New Playlist
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" style={{ color: textColor }} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: textColor }}>
                Playlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter playlist name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                style={{ color: '#000000' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: textColor }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your playlist"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 resize-none"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-50"
              style={{ color: textColor }}
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Create Playlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add to Playlist Modal Component
export function AddToPlaylistModal({
  isOpen,
  onClose,
  playlists,
  onAddToPlaylist,
  product,
  onCreateNew,
  primaryColor,
  textColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  playlists: any[];
  onAddToPlaylist: (playlistId: string) => void;
  product: any | null;
  onCreateNew: () => void;
  primaryColor: string;
  textColor: string;
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>
              Add to Playlist
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" style={{ color: textColor }} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: textColor }}>
              Product: {product.title}
            </p>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {playlists.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: `${textColor}80` }}>
                No playlists yet. Create one to get started!
              </p>
            ) : (
              playlists.map((playlist) => {
                const isInPlaylist = playlist.items?.some(
                  (item: any) => item.productId === product.id
                );
                return (
                  <button
                    key={playlist.id}
                    onClick={() => !isInPlaylist && onAddToPlaylist(playlist.id)}
                    disabled={isInPlaylist}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isInPlaylist
                        ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ color: textColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderIcon className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">{playlist.name}</p>
                          <p className="text-xs" style={{ color: `${textColor}80` }}>
                            {playlist.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      {isInPlaylist && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Added
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCreateNew}
              className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
              style={{ color: textColor }}
            >
              <PlusIcon className="w-5 h-5" />
              Create New Playlist
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-50"
              style={{ color: textColor }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

