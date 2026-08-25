"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import { request } from "@/lib/api";

export function useCustomer(id) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.customer(tenant?.id, id),
    queryFn: () => request({ url: `/customers/${id}`, method: "GET" }),
    enabled: Boolean(tenant?.id && id),
    retry: false,
  });
}
