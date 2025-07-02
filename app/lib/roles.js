export const roles = [
  { value: "user", label: "User", permissions: ["view"] },
  {
    value: "admin",
    label: "Admin",
    permissions: ["view", "add", "edit", "delete"],
  },
  { value: "manager", label: "Manager", permissions: ["view", "add", "edit"] },
];
