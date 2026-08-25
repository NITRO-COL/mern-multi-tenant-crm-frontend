"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Centred dialog on desktop, bottom sheet on mobile — a full-screen centred
 * modal on a phone leaves the primary action under the keyboard.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so keyboard users are not stranded behind it.
    const timer = setTimeout(() => {
      panelRef.current?.querySelector("input,select,textarea,button")?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[var(--surface)] shadow-xl",
          "rounded-t-2xl sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--border)]",
          size === "lg" ? "sm:max-w-2xl" : size === "sm" ? "sm:max-w-sm" : "sm:max-w-lg"
        )}
      >
        {/* Grab handle — signals the sheet is dismissible on touch. */}
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--border-strong)] sm:hidden" />

        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-3.5 pb-safe sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
