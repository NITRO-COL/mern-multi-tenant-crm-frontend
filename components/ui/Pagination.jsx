"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

/**
 * Server-driven pagination. The component never sees the full dataset — it only
 * knows the current page's metadata, which is the point: filtering and paging
 * happen in MongoDB, not in the browser.
 */
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-muted">
        Showing <span className="font-medium text-[var(--text)]">{from}</span>–
        <span className="font-medium text-[var(--text)]">{to}</span> of{" "}
        <span className="font-medium text-[var(--text)]">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <span className="px-1 text-xs text-muted whitespace-nowrap">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
