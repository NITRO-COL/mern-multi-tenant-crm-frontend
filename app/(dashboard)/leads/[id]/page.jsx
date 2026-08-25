"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Pencil, Phone, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import { humanize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { BackLink, DetailCard, DetailField, PersonRef } from "@/components/shared/RecordDetail";
import { useLead } from "@/features/leads/detail-hooks";
import { useConvertLead, useDeleteLead } from "@/features/leads/hooks";
import { LeadForm } from "@/features/leads/LeadForm";
import { ActivityTimeline } from "@/features/activities/ActivityTimeline";

export default function LeadDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();

  const { data, isLoading, isError, error, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    return (
      <div className="space-y-4">
        <BackLink href="/leads">Leads</BackLink>
        <Card>
          {/* A lead belonging to another tenant is a 404 here, exactly as the API reports it. */}
          <ErrorState
            error={error?.status === 404 ? { message: "This lead does not exist in your organization." } : error}
            onRetry={error?.status === 404 ? undefined : refetch}
          />
        </Card>
      </div>
    );
  }

  const lead = data.data;
  const canConvert = can("customer:create") && lead.status === "CONVERTED" && !lead.convertedCustomerId;

  const onDelete = async () => {
    await deleteLead.mutateAsync(lead._id);
    setConfirmDelete(false);
    router.replace("/leads");
  };

  return (
    <div className="space-y-5">
      <BackLink href="/leads">Leads</BackLink>

      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{lead.company}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-[var(--primary)]"
              >
                <Mail className="h-3.5 w-3.5" />
                {lead.email}
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-[var(--primary)]"
              >
                <Phone className="h-3.5 w-3.5" />
                {lead.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canConvert && (
              <Button
                variant="secondary"
                size="sm"
                loading={convertLead.isPending}
                onClick={() => convertLead.mutate({ id: lead._id, payload: {} })}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Convert to customer
              </Button>
            )}
            {can("lead:update") && (
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            {can("lead:delete") && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DetailCard title="Details">
            <DetailField label="Source">{humanize(lead.source)}</DetailField>
            <DetailField label="Status">
              <StatusBadge status={lead.status} />
            </DetailField>
            <DetailField label="Assigned to">
              <PersonRef user={lead.assignedTo} />
            </DetailField>
            <DetailField label="Created by">
              <PersonRef user={lead.createdBy} />
            </DetailField>
            <DetailField label="Created">{formatDate(lead.createdAt)}</DetailField>
            <DetailField label="Last updated">{formatDate(lead.updatedAt)}</DetailField>
            {lead.notes && (
              <DetailField label="Notes" className="sm:col-span-2">
                <p className="leading-relaxed whitespace-pre-wrap text-muted">{lead.notes}</p>
              </DetailField>
            )}
            {lead.convertedCustomerId && (
              <DetailField label="Converted" className="sm:col-span-2">
                <span className="text-emerald-600 dark:text-emerald-400">
                  Promoted to a customer on {formatDate(lead.convertedAt)}
                </span>
              </DetailField>
            )}
          </DetailCard>
        </div>

        <div className="lg:col-span-3">
          <ActivityTimeline recordId={lead._id} recordType="lead" recordName={lead.name} />
        </div>
      </div>

      <LeadForm open={editOpen} onClose={() => setEditOpen(false)} lead={lead} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        loading={deleteLead.isPending}
        title="Delete this lead?"
        message={`“${lead.name}” and its activity will be permanently removed.`}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-20" />
      <Card>
        <CardBody>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-40" />
          <Skeleton className="mt-4 h-4 w-72" />
        </CardBody>
      </Card>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
          </CardBody>
        </Card>
        <Card className="lg:col-span-3">
          <CardBody className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
