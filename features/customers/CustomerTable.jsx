"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn, formatDate, initials } from "@/lib/utils";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";

const COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true, hideBelow: "xl" },
  { key: "phone", label: "Phone", sortable: false, hideBelow: "xl" },
  { key: "company", label: "Company", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "owner", label: "Owner", sortable: false },
  { key: "createdAt", label: "Created", sortable: true },
];

const HIDE = "hidden xl:table-cell";

/** Same two-layout approach as the leads table: table on desktop, cards on phones. */
export function CustomerTable({ customers, sortBy, sortOrder, onSort, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-2.5 text-left text-xs font-medium text-muted",
                    col.hideBelow && HIDE
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[var(--text)]"
                    >
                      {col.label}
                      {sortBy === col.key ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th scope="col" className="relative w-12 px-4 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {customers.map((customer) => (
              <tr key={customer._id} className="transition-colors hover:bg-[var(--surface-hover)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium whitespace-nowrap">{customer.name}</span>
                    {customer.convertedFromLeadId && (
                      <Badge className="text-[10px]">Converted</Badge>
                    )}
                  </div>
                </td>
                <td className={cn("px-4 py-3 text-muted", HIDE)}>{customer.email}</td>
                <td className={cn("px-4 py-3 text-muted whitespace-nowrap", HIDE)}>{customer.phone}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{customer.company}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={customer.status} kind="customer" />
                </td>
                <td className="px-4 py-3">
                  <Owner user={customer.owner} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <RowActions customer={customer} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--border)] lg:hidden">
        {customers.map((customer) => (
          <div key={customer._id} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{customer.name}</p>
                <p className="truncate text-xs text-muted">{customer.company}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={customer.status} kind="customer" />
                <RowActions customer={customer} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>

            <p className="mt-2 truncate text-xs text-muted">{customer.email}</p>

            <div className="mt-2 flex items-center justify-between gap-2">
              <Owner user={customer.owner} />
              <span className="text-[11px] text-subtle">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Owner({ user }) {
  if (!user) return <span className="text-xs text-subtle">Unassigned</span>;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[10px] font-semibold text-[var(--text-muted)]">
        {initials(user.name)}
      </span>
      <span className="truncate text-xs text-muted">{user.name}</span>
    </span>
  );
}

function RowActions({ customer, onEdit, onDelete }) {
  const { can } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${customer.name}`}
        aria-expanded={open}
        className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-36 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
        >
          {can("customer:update") && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit(customer);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}

          {can("customer:delete") && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(customer);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
