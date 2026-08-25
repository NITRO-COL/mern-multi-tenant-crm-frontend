"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import { getLead } from "./api";

export function useLead(id) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.lead(tenant?.id, id),
    queryFn: () => getLead(id),
    enabled: Boolean(tenant?.id && id),
    // A record belonging to another tenant is a 404 — never worth retrying.
    retry: false,
  });
}
