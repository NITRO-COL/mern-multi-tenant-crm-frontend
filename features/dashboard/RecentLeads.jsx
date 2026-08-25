import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatRelative, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";

export function RecentLeads({ leads }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Recent leads"
        description="The five most recently added"
        action={
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {leads.length === 0 ? (
        <EmptyState title="No leads yet" message="New leads will appear here as they are added." />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {leads.map((lead) => (
            <li
              key={lead._id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] sm:px-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[11px] font-semibold text-[var(--text-muted)]">
                {initials(lead.name)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{lead.name}</p>
                <p className="truncate text-xs text-muted">{lead.company}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={lead.status} />
                <span className="text-[11px] text-subtle">{formatRelative(lead.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
