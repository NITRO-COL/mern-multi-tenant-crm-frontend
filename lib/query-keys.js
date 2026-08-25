/**
 * Every cached query is namespaced by tenant.
 *
 * Tenant isolation — client cache layer.
 *
 * The server never returns another organization's records, but the browser can
 * still *display* them: a key like ["leads", params] is identical for every
 * tenant, so after signing out of one account and into another the cache serves
 * the previous tenant's rows under the new tenant's chrome. With staleTime set,
 * React Query considers that data fresh and does not even refetch — it persists
 * until a hard reload.
 *
 * Two defences, both applied:
 *   1. queryClient.clear() on every login and logout (see auth-context)
 *   2. these keys, so entries from two tenants can never collide even if a
 *      clear is ever missed
 */
export const queryKeys = {
  dashboard: (tenantId) => ["tenant", tenantId, "dashboard"],
  leads: (tenantId, params) => ["tenant", tenantId, "leads", params],
  customers: (tenantId, params) => ["tenant", tenantId, "customers", params],
  users: (tenantId) => ["tenant", tenantId, "users"],

  /** Prefix for invalidating everything belonging to one tenant. */
  allForTenant: (tenantId) => ["tenant", tenantId],
};
