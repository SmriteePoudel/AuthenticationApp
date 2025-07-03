export const roles = [
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
