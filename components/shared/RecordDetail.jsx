"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate, initials } from "@/lib/utils";

/** Label/value pair — the unit every detail panel is built from. */
export function DetailField({ label, children, className }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium tracking-wide text-subtle uppercase">{label}</dt>
      <dd className="mt-1 text-sm break-words">{children ?? <span className="text-subtle">—</span>}</dd>
    </div>
  );
}

export function BackLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-[var(--text)]"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}

export function PersonRef({ user }) {
  if (!user) return <span className="text-subtle">Unassigned</span>;
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[10px] font-semibold text-[var(--text-muted)]">
        {initials(user.name)}
      </span>
      <span>{user.name}</span>
    </span>
  );
}

export function DetailCard({ title, children, footer }) {
  return (
    <Card>
      <CardBody>
        {title && <h2 className="mb-4 text-sm font-semibold">{title}</h2>}
        <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
        {footer}
      </CardBody>
    </Card>
  );
}

export { formatDate };
