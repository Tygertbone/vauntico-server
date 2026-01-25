"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children, side = 'right', className }) => {
  if (!isOpen) return null;

  const positionClasses = {
    left: "left-0 top-0 h-full w-3/4 border-r",
    right: "right-0 top-0 h-full w-3/4 border-l",
    top: "top-0 left-0 w-full h-1/2 border-b",
    bottom: "bottom-0 left-0 w-full h-1/2 border-t"
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out p-6",
          positionClasses[side],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
};

interface SheetTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
}

const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, onClick }) => (
  <div onClick={onClick}>
    {children}
  </div>
);

interface SheetCloseProps {
  children: React.ReactNode;
  onClick: () => void;
}

const SheetClose: React.FC<SheetCloseProps> = ({ children, onClick }) => (
  <button onClick={onClick} className="p-1 rounded hover:bg-gray-100">
    {children}
  </button>
);

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const SheetHeader: React.FC<SheetHeaderProps> = ({ children, className }) => (
  <div className={cn("pb-4", className)}>
    {children}
  </div>
);

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SheetTitle: React.FC<SheetTitleProps> = ({ children, className }) => (
  <h2 className={cn("text-lg font-semibold", className)}>
    {children}
  </h2>
);

interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const SheetDescription: React.FC<SheetDescriptionProps> = ({ children, className }) => (
  <p className={cn("text-sm text-gray-600", className)}>
    {children}
  </p>
);

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

const SheetFooter: React.FC<SheetFooterProps> = ({ children, className }) => (
  <div className={cn("pt-4 border-t flex justify-end space-x-2", className)}>
    {children}
  </div>
);

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

const SheetContent: React.FC<SheetContentProps> = ({ children, className }) => (
  <div className={cn("relative", className)}>
    <button className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100">
      <X className="h-4 w-4" />
    </button>
    {children}
  </div>
);

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
