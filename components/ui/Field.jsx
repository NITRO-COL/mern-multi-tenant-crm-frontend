"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-md border bg-[var(--surface)] px-3 text-[var(--text)] " +
  "placeholder:text-[var(--text-subtle)] transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/** Label + control + error message, wired together for screen readers. */
export function Field({ label, error, hint, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--danger)]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={cn(
        controlBase,
        "h-10",
        error ? "border-[var(--danger)]" : "border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={cn(
        controlBase,
        "h-10 cursor-pointer appearance-none bg-no-repeat pr-9",
        error ? "border-[var(--danger)]" : "border-[var(--border)]",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.65rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={cn(
        controlBase,
        "min-h-20 py-2 resize-y",
        error ? "border-[var(--danger)]" : "border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
});

export function useFieldId(prefix) {
  const id = useId();
  return `${prefix}-${id}`;
}
