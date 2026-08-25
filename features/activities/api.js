import { request } from "@/lib/api";

export const ACTIVITY_TYPES = ["CALL", "MEETING", "EMAIL", "NOTE", "TASK"];

/**
 * `recordId` may be a lead id or a customer id — the API resolves which, scoped
 * to the caller's tenant, and 404s if it is neither.
 */
export function listActivities(recordId, params) {
  return request({ url: `/activities/${recordId}`, method: "GET", params });
}

export function createActivity(payload) {
  return request({ url: "/activities", method: "POST", data: payload });
}

export function deleteActivity(id) {
  return request({ url: `/activities/${id}`, method: "DELETE" });
}
