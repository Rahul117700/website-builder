"use client";
import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Site, TemplateType } from "@/types";

interface EditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onEditSite: (site: Partial<Site>) => Promise<void>;
}

export default function EditSiteModal({ isOpen, onClose, site, onEditSite }: EditSiteModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<TemplateType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && site) {
      setName(site.name || "");
      setDescription(site.description || "");
      setTemplate(site.template || "general");
    }
  }, [isOpen, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site) return;
    setIsSubmitting(true);
    await onEditSite({
      id: site.id,
      name,
      description,
      template,
    });
    setIsSubmitting(false);
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
                      Edit Website
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Update your website details below.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="label">
                      Website Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field mt-1"
                      placeholder="My Awesome Website"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="label">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field mt-1"
                      rows={3}
                      placeholder="Describe your website"
                    />
                  </div>
                  <div>
                    <label htmlFor="template" className="label">
                      Template
                    </label>
                    <select
                      id="template"
                      name="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as TemplateType)}
                      className="input-field mt-1"
                      required
                    >
                      <option value="general">General Business</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="pharma">Pharmacy</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name}
                    className="btn-primary sm:col-start-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary mt-3 sm:col-start-1 sm:mt-0"
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