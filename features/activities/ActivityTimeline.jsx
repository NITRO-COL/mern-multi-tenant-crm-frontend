"use client";

import { useState } from "react";
import { CalendarClock, CheckSquare, Mail, MessageSquare, Phone, Plus, Trash2, Users } from "lucide-react";
import { cn, formatDate, formatRelative, humanize, initials } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useActivities, useDeleteActivity } from "./hooks";
import { ActivityForm } from "./ActivityForm";

/** Each type gets a glyph, so the timeline is scannable without reading titles. */
const TYPE_META = {
  CALL: { icon: Phone, tone: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  MEETING: { icon: Users, tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  EMAIL: { icon: Mail, tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  NOTE: { icon: MessageSquare, tone: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300" },
  TASK: { icon: CheckSquare, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
};

export function ActivityTimeline({ recordId, recordType, recordName }) {
  const { can } = useAuth();
  const { data, isLoading, isError, error, refetch } = useActivities(recordId);
  const deleteActivity = useDeleteActivity(recordId);

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const activities = data?.data ?? [];

  const confirmDelete = async () => {
    await deleteActivity.mutateAsync(deleting._id);
    setDeleting(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Activity"
        description={
          activities.length
            ? `${activities.length} ${activities.length === 1 ? "entry" : "entries"}`
            : "Calls, meetings, emails and notes"
        }
        action={
          can("activity:create") && (
            <Button size="sm" variant="secondary" onClick={() => setFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Log activity
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-4 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No activity yet"
          message={`Log a call, meeting, email or note against ${recordName ?? "this record"}.`}
          action={
            can("activity:create") && (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Log activity
              </Button>
            )
          }
        />
      ) : (
        <ol className="p-4 sm:p-5">
          {activities.map((activity, i) => (
            <TimelineItem
              key={activity._id}
              activity={activity}
              isLast={i === activities.length - 1}
              onDelete={setDeleting}
            />
          ))}
        </ol>
      )}

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        recordId={recordId}
        recordType={recordType}
        recordName={recordName}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteActivity.isPending}
        title="Delete this activity?"
        message={`“${deleting?.title}” will be permanently removed.`}
      />
    </Card>
  );
}

function TimelineItem({ activity, isLast, onDelete }) {
  const { can } = useAuth();
  const meta = TYPE_META[activity.type] ?? TYPE_META.NOTE;
  const Icon = meta.icon;

  return (
    <li className="group relative flex gap-3 pb-5 last:pb-0">
      {/* The rail is drawn per-item and skipped on the last, so it never dangles. */}
      {!isLast && (
        <span className="absolute top-9 bottom-0 left-4 w-px bg-[var(--border)]" aria-hidden />
      )}

      <span
        className={cn("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.tone)}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium">{activity.title}</span>
          <span className="text-[11px] text-subtle">{humanize(activity.type)}</span>
          <span
            className="ml-auto text-[11px] whitespace-nowrap text-subtle"
            title={formatDate(activity.createdAt, { withTime: true })}
          >
            {formatRelative(activity.createdAt)}
          </span>
        </div>

        {activity.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted">{activity.description}</p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          {activity.createdBy && (
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[9px] font-semibold text-[var(--text-muted)]">
                {initials(activity.createdBy.name)}
              </span>
              <span className="text-[11px] text-subtle">{activity.createdBy.name}</span>
            </span>
          )}

          {activity.dueAt && (
            <span className="text-[11px] text-subtle">
              · due {formatDate(activity.dueAt)}
            </span>
          )}

          {can("activity:delete") && (
            <button
              type="button"
              onClick={() => onDelete(activity)}
              aria-label={`Delete activity ${activity.title}`}
              className="ml-auto rounded p-1 text-[var(--text-subtle)] opacity-0 transition-opacity hover:text-[var(--danger)] focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
