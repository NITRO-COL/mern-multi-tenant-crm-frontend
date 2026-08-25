/**
 * Mirror of the server's RBAC table.
 *
 * This drives UI affordances only — hiding a delete button the API would reject
 * anyway. It is a convenience, never a security boundary: the server re-checks
 * every request, so a user who forges this client state gains nothing.
 */
const PERMISSIONS = {
  ADMIN: ["lead:*", "customer:*", "activity:*", "report:read", "user:manage"],
  SALES: [
    "lead:read", "lead:create", "lead:update",
    "customer:read", "customer:create", "customer:update",
    "activity:read", "activity:create",
    "report:read",
  ],
};

export function hasPermission(role, permission) {
  const granted = PERMISSIONS[role];
  if (!granted) return false;
  if (granted.includes(permission)) return true;
  const [resource] = permission.split(":");
  return granted.includes(`${resource}:*`);
}
