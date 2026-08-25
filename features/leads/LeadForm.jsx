"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { humanize } from "@/lib/utils";
import { LEAD_SOURCES, LEAD_STATUSES } from "./api";
import { useCreateLead, useTenantUsers, useUpdateLead } from "./hooks";

/**
 * Mirrors the server's Zod schema. Validating here gives instant feedback;
 * the server validates again because client-side rules are only a courtesy.
 */
const schema = z.object({
  name: z.string().trim().min(1, "Lead name is required").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 digits")
    .max(20)
    .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number"),
  company: z.string().trim().min(1, "Company is required").max(160),
  status: z.enum(LEAD_STATUSES),
  source: z.enum(LEAD_SOURCES),
  assignedTo: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

const EMPTY = {
  name: "", email: "", phone: "", company: "",
  status: "NEW", source: "WEBSITE", assignedTo: "", notes: "",
};

export function LeadForm({ open, onClose, lead }) {
  const isEdit = Boolean(lead);
  const { data: users } = useTenantUsers();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      lead
        ? {
            name: lead.name ?? "",
            email: lead.email ?? "",
            phone: lead.phone ?? "",
            company: lead.company ?? "",
            status: lead.status ?? "NEW",
            source: lead.source ?? "WEBSITE",
            assignedTo: lead.assignedTo?._id ?? "",
            notes: lead.notes ?? "",
          }
        : EMPTY
    );
  }, [open, lead, reset]);

  const onSubmit = async (values) => {
    // An empty select means "unassigned", which the API expects as null.
    const payload = { ...values, assignedTo: values.assignedTo || null };

    try {
      if (isEdit) await updateLead.mutateAsync({ id: lead._id, payload });
      else await createLead.mutateAsync(payload);
      onClose();
    } catch (error) {
      // Surface field-level server errors (duplicate email, bad assignee) inline.
      if (error.details?.length) {
        for (const detail of error.details) {
          setError(detail.field.replace(/^body\./, ""), { message: detail.message });
        }
      } else if (error.status === 409) {
        setError("email", { message: error.message });
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit lead" : "New lead"}
      description={isEdit ? "Update this lead's details." : "Add a lead to your organization's pipeline."}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="lead-form" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create lead"}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message} required>
            <Input placeholder="Rohit Verma" error={errors.name} {...register("name")} />
          </Field>

          <Field label="Company" error={errors.company?.message} required>
            <Input placeholder="Nexus Retail" error={errors.company} {...register("company")} />
          </Field>

          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="rohit@nexusretail.com" error={errors.email} {...register("email")} />
          </Field>

          <Field label="Phone" error={errors.phone?.message} required>
            <Input type="tel" placeholder="+91 98765 43210" error={errors.phone} {...register("phone")} />
          </Field>

          <Field label="Status" error={errors.status?.message}>
            <Select error={errors.status} {...register("status")}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{humanize(s)}</option>
              ))}
            </Select>
          </Field>

          <Field label="Source" error={errors.source?.message}>
            <Select error={errors.source} {...register("source")}>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{humanize(s)}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Assigned to"
          error={errors.assignedTo?.message}
          hint="Only members of your own organization appear here."
        >
          <Select error={errors.assignedTo} {...register("assignedTo")}>
            <option value="">Unassigned</option>
            {users?.data?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} · {u.role}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Notes" error={errors.notes?.message}>
          <Textarea rows={3} placeholder="Context, next steps, budget signals…" {...register("notes")} />
        </Field>
      </form>
    </Modal>
  );
}
