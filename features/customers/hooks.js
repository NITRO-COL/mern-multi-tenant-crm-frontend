"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as customerApi from "./api";

const KEY = "customers";

export function useCustomers(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => customerApi.listCustomers(params),
    placeholderData: (previous) => previous,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [KEY] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
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
