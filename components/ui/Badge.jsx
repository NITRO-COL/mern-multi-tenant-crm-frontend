import { cn } from "@/lib/utils";
import { humanize } from "@/lib/utils";

/**
 * Status colours are semantic and deliberately low-saturation — a table of
 * neon pills is harder to scan, not easier.
 */
const LEAD_STATUS = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  CONTACTED: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  QUALIFIED: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  CONVERTED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  LOST: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const CUSTOMER_STATUS = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  INACTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  CHURNED: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const ROLE = {
  ADMIN: "bg-brand-50 text-brand-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  SALES: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  SUPER_ADMIN: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
};

const NEUTRAL = "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300";

export function Badge({ children, className, tone = NEUTRAL }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, kind = "lead" }) {
  const map = kind === "customer" ? CUSTOMER_STATUS : LEAD_STATUS;
  return <Badge tone={map[status] ?? NEUTRAL}>{humanize(status)}</Badge>;
}

export function RoleBadge({ role }) {
  return <Badge tone={ROLE[role] ?? NEUTRAL}>{role}</Badge>;
}
