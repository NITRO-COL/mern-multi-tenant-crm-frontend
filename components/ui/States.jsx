import { AlertCircle, Inbox, RefreshCw, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/** Shimmering placeholder block. */
export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/** Table-shaped skeleton — matching the real layout avoids a jarring swap. */
export function TableSkeleton({ rows = 6, columns = 6 }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-[22%]" : c === columns - 1 ? "w-[10%]" : "w-[14%]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4, className }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-hover)]">
        <Icon className="h-5 w-5 text-[var(--text-muted)]" />
      </div>
      <h3 className="mt-3.5 text-sm font-semibold text-[var(--text)]">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NoResults({ term, onClear }) {
  return (
    <EmptyState
      icon={SearchX}
      title="No matches found"
      message={term ? `Nothing matched “${term}”. Try a different search or clear the filters.` : "Try adjusting your filters."}
      action={
        onClear && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )
      }
    />
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--danger-soft)]">
        <AlertCircle className="h-5 w-5 text-[var(--danger)]" />
      </div>
      <h3 className="mt-3.5 text-sm font-semibold text-[var(--text)]">Could not load this</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{error?.message ?? "An unexpected error occurred."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
