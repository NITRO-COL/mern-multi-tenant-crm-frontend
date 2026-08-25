"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { RoleBadge } from "@/components/ui/Badge";
import { getDashboard } from "@/features/dashboard/api";
import { NAV_ITEMS } from "./nav-items";

/**
 * Desktop rail. Mobile navigation is <MobileNav>.
 *
 * The rail carries the tenant identity, per-section counts and a pipeline
 * summary rather than three links and empty space. In a multi-tenant product
 * "which organization am I in" is the one thing that should never be ambiguous,
 * so it sits at the top of every screen.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, tenant, logout } = useAuth();

  // Shares the dashboard's cache entry — the sidebar costs no extra request.
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, staleTime: 30_000 });
  const kpis = data?.data?.kpis;

  const counts = {
    "/leads": kpis?.totalLeads,
    "/customers": kpis?.totalCustomers,
  };

  // sticky + h-dvh: without it the rail grows to document height and the pinned
  // user card ends up below the fold on any page that scrolls.
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--border)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Morsh CRM</span>
      </div>

      {/* Whose data am I looking at? */}
      <div className="border-b border-[var(--border)] p-3">
        <div className="flex items-center gap-2.5 rounded-md bg-[var(--surface-hover)] px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-[11px] font-semibold text-white">
            {initials(tenant?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{tenant?.name}</p>
            <p className="truncate text-[11px] text-subtle">{tenant?.slug}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const count = counts[href];
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--surface-hover)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {count !== undefined && (
                <span className="text-xs tabular-nums text-subtle">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {kpis && <PipelineSummary kpis={kpis} />}

      {/* Pinned to the bottom — the rail ends deliberately instead of trailing off. */}
      <div className="mt-auto border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-semibold text-white">
            {initials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-[11px] text-subtle">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 px-1">
          <RoleBadge role={user?.role} />
        </div>
      </div>
    </aside>
  );
}

/** Four pipeline stages as proportional bars — the shape of the funnel at a glance. */
function PipelineSummary({ kpis }) {
  const stages = [
    { label: "New", value: kpis.newLeads, color: "var(--chart-stage-1)" },
    { label: "Contacted", value: kpis.contactedLeads, color: "var(--chart-stage-2)" },
    { label: "Qualified", value: kpis.qualifiedLeads, color: "var(--chart-stage-3)" },
    { label: "Converted", value: kpis.convertedLeads, color: "var(--chart-stage-4)" },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="border-t border-[var(--border)] px-4 py-3.5">
      <p className="mb-2.5 text-[10px] font-semibold tracking-wide text-subtle uppercase">Pipeline</p>
      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-16 shrink-0 truncate text-[11px] text-muted">{s.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${(s.value / max) * 100}%`, backgroundColor: s.color }}
              />
            </span>
            <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-muted">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
