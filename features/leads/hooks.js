"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import * as leadApi from "./api";

export function useLeads(params) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads(tenant?.id, params),
    queryFn: () => leadApi.listLeads(params),
    placeholderData: (previous) => previous, // keeps the table stable while paging
  });
}

export function useTenantUsers() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.users(tenant?.id),
    queryFn: () => leadApi.listUsers(),
    staleTime: 5 * 60_000,
  });
}

/** Anything that changes lead data also invalidates the dashboard counters. */
/** One writer touches leads, dashboard counters and (on convert) customers. */
function useInvalidate() {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.allForTenant(tenant?.id) });
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
