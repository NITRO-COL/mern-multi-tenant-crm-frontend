"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 pt-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--danger-soft)]">
          <AlertTriangle className="h-4.5 w-4.5 text-[var(--danger)]" />
        </div>
        <p className="pt-1.5 text-sm text-muted">{message}</p>
      </div>
    </Modal>
  );
}
