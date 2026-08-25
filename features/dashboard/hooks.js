"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import { getDashboard } from "./api";

export function useDashboard() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard(tenant?.id),
    queryFn: getDashboard,
    enabled: Boolean(tenant?.id),
  });
}
