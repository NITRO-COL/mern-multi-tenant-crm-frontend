"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { humanize } from "@/lib/utils";
import { useTenantUsers } from "@/features/leads/hooks";
import { CUSTOMER_STATUSES } from "./api";
import { useCreateCustomer, useUpdateCustomer } from "./hooks";

const schema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 digits")
    .max(20)
    .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number"),
  company: z.string().trim().min(1, "Company is required").max(160),
  status: z.enum(CUSTOMER_STATUSES),
  owner: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

const EMPTY = {
  name: "", email: "", phone: "", company: "",
  status: "ACTIVE", owner: "", notes: "",
};

export function CustomerForm({ open, onClose, customer }) {
  const isEdit = Boolean(customer);
  const { data: users } = useTenantUsers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

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
      customer
        ? {
            name: customer.name ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            company: customer.company ?? "",
            status: customer.status ?? "ACTIVE",
            owner: customer.owner?._id ?? "",
            notes: customer.notes ?? "",
          }
        : EMPTY
    );
  }, [open, customer, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values, owner: values.owner || null };
    try {
      if (isEdit) await updateCustomer.mutateAsync({ id: customer._id, payload });
      else await createCustomer.mutateAsync(payload);
      onClose();
    } catch (error) {
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
      title={isEdit ? "Edit customer" : "New customer"}
      description={isEdit ? "Update this account's details." : "Add a customer to your organization."}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create customer"}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message} required>
            <Input placeholder="Kavya Reddy" error={errors.name} {...register("name")} />
          </Field>

          <Field label="Company" error={errors.company?.message} required>
            <Input placeholder="Marlin Shipping" error={errors.company} {...register("company")} />
          </Field>

          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="kavya@marlin.com" error={errors.email} {...register("email")} />
          </Field>

          <Field label="Phone" error={errors.phone?.message} required>
            <Input type="tel" placeholder="+91 98765 43210" error={errors.phone} {...register("phone")} />
          </Field>

          <Field label="Status" error={errors.status?.message}>
            <Select error={errors.status} {...register("status")}>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s}>{humanize(s)}</option>
              ))}
            </Select>
          </Field>

          <Field label="Account owner" error={errors.owner?.message}>
            <Select error={errors.owner} {...register("owner")}>
              <option value="">Unassigned</option>
              {users?.data?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} · {u.role}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes" error={errors.notes?.message}>
          <Textarea rows={3} placeholder="Account context, renewal dates, key contacts…" {...register("notes")} />
        </Field>
      </form>
    </Modal>
  );
}
