"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn, formatDate, humanize, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";

const COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true, hideBelow: "xl" },
  { key: "phone", label: "Phone", sortable: false, hideBelow: "xl" },
  { key: "company", label: "Company", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "source", label: "Source", sortable: true, hideBelow: "xl" },
  { key: "assignedTo", label: "Assigned", sortable: false },
  { key: "createdAt", label: "Created", sortable: true },
];

const HIDE_CLASS = { xl: "hidden xl:table-cell" };

/**
 * One dataset, two layouts.
 *
 * Below `lg` the table is replaced by a card list rather than being squeezed or
 * left to scroll sideways — an eight-column table is unreadable on a phone, and
 * a page that scrolls horizontally reads as broken.
 */
export function LeadTable({ leads, sortBy, sortOrder, onSort, onEdit, onDelete, onConvert }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <DesktopTable
          leads={leads}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          onEdit={onEdit}
          onDelete={onDelete}
          onConvert={onConvert}
        />
      </div>
      <div className="divide-y divide-[var(--border)] lg:hidden">
        {leads.map((lead) => (
          <MobileCard
            key={lead._id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
            onConvert={onConvert}
          />
        ))}
      </div>
    </>
  );
}

function DesktopTable({ leads, sortBy, sortOrder, onSort, onEdit, onDelete, onConvert }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--border)]">
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={cn(
                "px-4 py-2.5 text-left text-xs font-medium text-muted",
                col.hideBelow && HIDE_CLASS[col.hideBelow]
              )}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[var(--text)]"
                >
                  {col.label}
                  <SortIcon active={sortBy === col.key} order={sortOrder} />
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
        {leads.map((lead) => (
          <tr key={lead._id} className="transition-colors hover:bg-[var(--surface-hover)]">
            <td className="px-4 py-3 font-medium whitespace-nowrap">
              <Link href={`/leads/${lead._id}`} className="hover:text-[var(--primary)] hover:underline">
                {lead.name}
              </Link>
            </td>
            <td className={cn("px-4 py-3 text-muted", HIDE_CLASS.xl)}>{lead.email}</td>
            <td className={cn("px-4 py-3 text-muted whitespace-nowrap", HIDE_CLASS.xl)}>{lead.phone}</td>
            <td className="px-4 py-3 text-muted whitespace-nowrap">{lead.company}</td>
            <td className="px-4 py-3">
              <StatusBadge status={lead.status} />
            </td>
            <td className={cn("px-4 py-3 text-muted whitespace-nowrap", HIDE_CLASS.xl)}>{humanize(lead.source)}</td>
            <td className="px-4 py-3">
              <Assignee user={lead.assignedTo} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(lead.createdAt)}</td>
            <td className="px-4 py-3">
              <RowActions lead={lead} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MobileCard({ lead, onEdit, onDelete, onConvert }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/leads/${lead._id}`} className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          <p className="truncate text-xs text-muted">{lead.company}</p>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <StatusBadge status={lead.status} />
          <RowActions lead={lead} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} />
        </div>
      </div>

      <dl className="relative mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="col-span-2 truncate">
          <dt className="sr-only">Email</dt>
          <dd className="truncate text-muted">{lead.email}</dd>
        </div>
        <div>
          <dt className="sr-only">Phone</dt>
          <dd className="text-muted">{lead.phone}</dd>
        </div>
        <div className="text-right">
          <dt className="sr-only">Created</dt>
          <dd className="text-subtle">{formatDate(lead.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <Assignee user={lead.assignedTo} />
        <span className="text-[11px] text-subtle">{humanize(lead.source)}</span>
      </div>
    </div>
  );
}

function Assignee({ user }) {
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

function SortIcon({ active, order }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

function RowActions({ lead, onEdit, onDelete, onConvert }) {
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

  const canConvert =
    can("customer:create") && lead.status === "CONVERTED" && !lead.convertedCustomerId;

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${lead.name}`}
        aria-expanded={open}
        className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-44 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
        >
          <MenuItem icon={Eye} href={`/leads/${lead._id}`} onClick={() => setOpen(false)}>
            View details
          </MenuItem>

          {can("lead:update") && (
            <MenuItem
              icon={Pencil}
              onClick={() => {
                setOpen(false);
                onEdit(lead);
              }}
            >
              Edit
            </MenuItem>
          )}

          {canConvert && (
            <MenuItem
              icon={UserPlus}
              onClick={() => {
                setOpen(false);
                onConvert(lead);
              }}
            >
              Convert to customer
            </MenuItem>
          )}

          {/* Hidden for SALES — and rejected with 403 by the API regardless. */}
          {can("lead:delete") && (
            <MenuItem
              icon={Trash2}
              destructive
              onClick={() => {
                setOpen(false);
                onDelete(lead);
              }}
            >
              Delete
            </MenuItem>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, children, destructive, onClick, href }) {
  const className = cn(
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
    destructive
      ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
      : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
  );

  const content = (
    <>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
