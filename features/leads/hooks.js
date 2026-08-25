"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as leadApi from "./api";

const KEY = "leads";

export function useLeads(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => leadApi.listLeads(params),
    placeholderData: (previous) => previous, // keeps the table stable while paging
  });
}

export function useTenantUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => leadApi.listUsers(),
    staleTime: 5 * 60_000,
  });
}

/** Anything that changes lead data also invalidates the dashboard counters. */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [KEY] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };
}

export function useCreateLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: leadApi.createLead,
    onSuccess: () => {
      toast.success("Lead created");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }) => leadApi.updateLead(id, payload),
    onSuccess: () => {
      toast.success("Lead updated");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: leadApi.deleteLead,
    onSuccess: () => {
      toast.success("Lead deleted");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useConvertLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }) => leadApi.convertLead(id, payload),
    onSuccess: () => {
      toast.success("Lead converted to customer");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}
