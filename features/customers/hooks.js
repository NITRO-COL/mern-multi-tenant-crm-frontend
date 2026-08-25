"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import * as customerApi from "./api";

export function useCustomers(params) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.customers(tenant?.id, params),
    queryFn: () => customerApi.listCustomers(params),
    placeholderData: (previous) => previous,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.allForTenant(tenant?.id) });
}

export function useCreateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      toast.success("Customer created");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }) => customerApi.updateCustomer(id, payload),
    onSuccess: () => {
      toast.success("Customer updated");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      toast.success("Customer deleted");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}
