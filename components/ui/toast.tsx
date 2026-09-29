"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "error";
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
  className,
}: ToastProps) {
  const icons = {
    default: null,
    success: <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />,
    warning: <Info className="h-5 w-5 text-honey shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rust shrink-0" />,
  };

  return (
    <div
      role="status"
      className={cn(
        "relative flex w-full max-w-sm items-center gap-3 rounded-2xl p-4 shadow-md transition-all duration-200 ease-calm",
        "bg-cream-50/70 backdrop-blur-xl border border-white/60 text-ink",
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <p className="text-small font-semibold text-ink leading-tight">{title}</p>}
        {description && (
          <p className="text-caption text-ink-soft leading-normal mt-0.5">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-full p-1 text-ink-faint hover:text-ink hover:bg-cream-100/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
