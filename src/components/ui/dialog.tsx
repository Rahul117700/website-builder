import * as React from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  return (
    <Transition show={open} as={React.Fragment}>
      <HeadlessDialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onOpenChange}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
          </Transition.Child>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
              {children}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}
export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={"text-xl font-bold " + className}>{children}</h2>;
}
export function DialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"text-gray-500 " + className}>{children}</div>;
}
export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"mt-4 flex justify-end gap-2 " + className}>{children}</div>;
} 