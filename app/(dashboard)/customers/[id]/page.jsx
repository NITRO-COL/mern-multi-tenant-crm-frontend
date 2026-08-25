"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { BackLink, DetailCard, DetailField, PersonRef } from "@/components/shared/RecordDetail";
import { useCustomer } from "@/features/customers/detail-hooks";
import { useDeleteCustomer } from "@/features/customers/hooks";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { ActivityTimeline } from "@/features/activities/ActivityTimeline";

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();

  const { data, isLoading, isError, error, refetch } = useCustomer(id);
  const deleteCustomer = useDeleteCustomer();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    return (
      <div className="space-y-4">
        <BackLink href="/customers">Customers</BackLink>
        <Card>
          <ErrorState
            error={
              error?.status === 404
                ? { message: "This customer does not exist in your organization." }
                : error
            }
            onRetry={error?.status === 404 ? undefined : refetch}
          />
        </Card>
      </div>
    );
  }

  const customer = data.data;

  const onDelete = async () => {
    await deleteCustomer.mutateAsync(customer._id);
    setConfirmDelete(false);
    router.replace("/customers");
  };

  return (
    <div className="space-y-5">
      <BackLink href="/customers">Customers</BackLink>

      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
              <StatusBadge status={customer.status} kind="customer" />
              {customer.convertedFromLeadId && <Badge className="text-[10px]">Converted from lead</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted">{customer.company}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-[var(--primary)]"
              >
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-[var(--primary)]"
              >
                <Phone className="h-3.5 w-3.5" />
                {customer.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {can("customer:update") && (
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            {can("customer:delete") && (
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
            <DetailField label="Status">
              <StatusBadge status={customer.status} kind="customer" />
            </DetailField>
            <DetailField label="Account owner">
              <PersonRef user={customer.owner} />
            </DetailField>
            <DetailField label="Created by">
              <PersonRef user={customer.createdBy} />
            </DetailField>
            <DetailField label="Created">{formatDate(customer.createdAt)}</DetailField>
            {customer.notes && (
              <DetailField label="Notes" className="sm:col-span-2">
                <p className="leading-relaxed whitespace-pre-wrap text-muted">{customer.notes}</p>
              </DetailField>
            )}
          </DetailCard>
        </div>

        <div className="lg:col-span-3">
          <ActivityTimeline recordId={customer._id} recordType="customer" recordName={customer.name} />
        </div>
      </div>

      <CustomerForm open={editOpen} onClose={() => setEditOpen(false)} customer={customer} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        loading={deleteCustomer.isPending}
        title="Delete this customer?"
        message={`“${customer.name}” and its activity will be permanently removed.`}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-24" />
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
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
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
