"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { queryKeys } from "@/lib/query-keys";
import * as activityApi from "./api";

export function useActivities(recordId) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: queryKeys.activities(tenant?.id, recordId),
    queryFn: () => activityApi.listActivities(recordId, { page: 1, limit: 50 }),
    enabled: Boolean(tenant?.id && recordId),
  });
}

function useInvalidateTimeline(recordId) {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities(tenant?.id, recordId) });
    // The dashboard counts activities too.
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(tenant?.id) });
  };
}

export function useCreateActivity(recordId) {
  const invalidate = useInvalidateTimeline(recordId);
  return useMutation({
    mutationFn: activityApi.createActivity,
    onSuccess: () => {
      toast.success("Activity logged");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteActivity(recordId) {
  const invalidate = useInvalidateTimeline(recordId);
  return useMutation({
    mutationFn: activityApi.deleteActivity,
    onSuccess: () => {
      toast.success("Activity deleted");
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}
