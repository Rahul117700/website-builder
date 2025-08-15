"use client";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AddPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (data: { title: string; slug: string; content: string; isPublished: boolean }) => Promise<void>;
}

export default function AddPageModal({ isOpen, onClose, onAddPage }: AddPageModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAddPage({ title, slug, content, isPublished });
    setIsSubmitting(false);
    setTitle("");
    setSlug("");
    setContent("");
    setIsPublished(true);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-4 text-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-black px-4 sm:px-6 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-md sm:max-w-lg">
                <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-black text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Add New Page
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill out the form below to add a new page to your website.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="title" className="label">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="input-field mt-1"
                      placeholder="Page Title"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className="label">Slug</label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={slug}
                      onChange={e => setSlug(e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase())}
                      className="input-field mt-1"
                      placeholder="page-slug"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="label">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="input-field mt-1"
                      rows={4}
                      placeholder="Page content..."
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={isPublished}
                      onChange={e => setIsPublished(e.target.checked)}
                      className="form-checkbox text-purple-600 mr-2"
                    />
                    <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">Published</label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title || !slug}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Adding...
                      </span>
                    ) : (
                      "Add Page"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary w-full mt-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 