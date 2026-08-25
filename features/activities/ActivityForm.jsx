"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { humanize } from "@/lib/utils";
import { ACTIVITY_TYPES } from "./api";
import { useCreateActivity } from "./hooks";

const schema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  dueAt: z.string().optional(),
});

const EMPTY = { type: "CALL", title: "", description: "", dueAt: "" };

export function ActivityForm({ open, onClose, recordId, recordType, recordName }) {
  const createActivity = useCreateActivity(recordId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const type = watch("type");

  const onSubmit = async (values) => {
    /**
     * The server requires exactly one of leadId / customerId — which one depends
     * on the page this timeline is mounted on.
     */
    const payload = {
      type: values.type,
      title: values.title,
      description: values.description || "",
      ...(values.dueAt ? { dueAt: new Date(values.dueAt).toISOString() } : {}),
      ...(recordType === "customer" ? { customerId: recordId } : { leadId: recordId }),
    };

    try {
      await createActivity.mutateAsync(payload);
      onClose();
    } catch (error) {
      if (error.details?.length) {
        for (const detail of error.details) {
          setError(detail.field.replace(/^body\./, ""), { message: detail.message });
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log activity"
      description={recordName ? `Against ${recordName}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="activity-form" loading={isSubmitting}>
            Save activity
          </Button>
        </>
      }
    >
      <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        <Field label="Type" error={errors.type?.message}>
          <Select error={errors.type} {...register("type")}>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{humanize(t)}</option>
            ))}
          </Select>
        </Field>

        <Field label="Title" error={errors.title?.message} required>
          <Input
            placeholder={
              type === "CALL" ? "Intro call"
              : type === "MEETING" ? "Requirement workshop"
              : type === "EMAIL" ? "Sent proposal"
              : type === "TASK" ? "Share case study"
              : "Budget signal"
            }
            error={errors.title}
            {...register("title")}
          />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <Textarea rows={3} placeholder="What happened, and what comes next?" {...register("description")} />
        </Field>

        {/* Only a task carries a due date — the others already happened. */}
        {type === "TASK" && (
          <Field label="Due date" error={errors.dueAt?.message}>
            <Input type="date" {...register("dueAt")} />
          </Field>
        )}
      </form>
    </Modal>
  );
}
