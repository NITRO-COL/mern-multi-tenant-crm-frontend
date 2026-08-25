import { request } from "@/lib/api";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
export const LEAD_SOURCES = [
  "WEBSITE", "REFERRAL", "COLD_CALL", "EMAIL_CAMPAIGN", "SOCIAL_MEDIA", "EVENT", "OTHER",
];

/**
 * Search, filtering, sorting and paging are all query parameters — the browser
 * never holds more than one page of leads.
 */
export function listLeads(params) {
  return request({ url: "/leads", method: "GET", params });
}

export function getLead(id) {
  return request({ url: `/leads/${id}`, method: "GET" });
}

export function createLead(payload) {
  return request({ url: "/leads", method: "POST", data: payload });
}

export function updateLead(id, payload) {
  return request({ url: `/leads/${id}`, method: "PUT", data: payload });
}

export function deleteLead(id) {
  return request({ url: `/leads/${id}`, method: "DELETE" });
}

export function convertLead(id, payload = {}) {
  return request({ url: `/leads/${id}/convert`, method: "POST", data: payload });
}

export function listUsers() {
  return request({ url: "/users", method: "GET" });
}
