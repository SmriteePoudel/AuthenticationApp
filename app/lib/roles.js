export const permissions = [
  "permission_create",
  "permission_read",
  "permission_update",
  "permission_delete",
  "role_create",
  "role_read",
  "role_update",
  "role_delete",
  "user_create",
  "user_read",
  "user_update",
  "user_delete",
  "synchronize",
];

export const roles = [
  {
    value: "superadmin",
    label: "Super Admin",
    permissions: [...permissions],
  },
  {
    value: "admin",
    label: "Admin",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    value: "user",
    label: "User",
    permissions: ["create", "read"],
  },
  {
    value: "manager",
    label: "Manager",
    permissions: ["create", "read", "update"],
  },
];
