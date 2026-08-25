import { request } from "@/lib/api";

/**
 * One endpoint, one round trip. Every count is produced by a tenant-scoped
 * MongoDB aggregation server-side — the browser never sees, or sums, raw records.
 */
export function getDashboard() {
  return request({ url: "/reports/dashboard", method: "GET" });
}
