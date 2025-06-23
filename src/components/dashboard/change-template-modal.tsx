"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Site, TemplateType } from "@/types";

interface ChangeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onChangeTemplate: (template: TemplateType) => Promise<void>;
}

const templates: { value: TemplateType; label: string; desc: string }[] = [
  { value: "general", label: "General Business", desc: "A clean, modern template for any business." },
  { value: "restaurant", label: "Restaurant", desc: "Perfect for restaurants, cafes, and food businesses." },
  { value: "pharma", label: "Pharmacy", desc: "Ideal for pharmacies and healthcare sites." },
];

export default function ChangeTemplateModal({ isOpen, onClose, site, onChangeTemplate }: ChangeTemplateModalProps) {
  const [selected, setSelected] = useState<TemplateType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && site) {
      setSelected(site.template);
    }
  }, [isOpen, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || selected === site.template) return;
    setIsSubmitting(true);
    await onChangeTemplate(selected);
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Change Website Template
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pick a new template for your website. This will update the look and feel instantly.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="space-y-3">
                    {templates.map((tpl) => (
                      <label
                        key={tpl.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selected === tpl.value
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/10"
                            : "border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={tpl.value}
                          checked={selected === tpl.value}
                          onChange={() => setSelected(tpl.value)}
                          className="form-radio text-purple-600 mr-3"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{tpl.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tpl.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !site || selected === site.template}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                        Changing...
                      </span>
                    ) : (
                      "Change Template"
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