"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/Badge";

/**
 * Test logins for the two seeded organizations, one click away.
 *
 * Present so a reviewer can verify tenant isolation immediately: sign in as
 * Acme, note a record id, sign in as Globex, and try to reach it.
 */
const TENANTS = [
  {
    name: "Acme Corporation",
    slug: "acme",
    users: [
      { role: "ADMIN", email: "admin@acme.com", password: "Admin@123" },
      { role: "SALES", email: "sales@acme.com", password: "Sales@123" },
    ],
  },
  {
    name: "Globex Industries",
    slug: "globex",
    users: [
      { role: "ADMIN", email: "admin@globex.com", password: "Admin@123" },
      { role: "SALES", email: "sales@globex.com", password: "Sales@123" },
    ],
  },
];

export function DemoCredentials({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="text-xs font-medium text-[var(--text-muted)]">
          Demo accounts — two isolated organizations
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-[var(--text-subtle)] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--border)] px-3.5 py-3">
          {TENANTS.map((tenant) => (
            <div key={tenant.slug}>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-subtle uppercase">
                {tenant.name}
              </p>
              <div className="space-y-1">
                {tenant.users.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => onSelect(user.email, user.password)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <span className="min-w-0 truncate text-xs text-[var(--text)]">{user.email}</span>
                    <RoleBadge role={user.role} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
