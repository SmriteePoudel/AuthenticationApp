import { roles } from "@/app/lib/roles";
import { users } from "@/app/lib/db";

function getPermissionsForRoles(userRoles) {
  const userRoleSet = new Set(
    Array.isArray(userRoles) ? userRoles : [userRoles]
  );
  const permissions = new Set();
  roles.forEach((role) => {
    if (userRoleSet.has(role.value)) {
      role.permissions.forEach((perm) => permissions.add(perm));
    }
  });
  return Array.from(permissions);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return Response.json({ message: "Email is required" }, { status: 400 });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }
  const permissions = getPermissionsForRoles(user.roles);
  return Response.json({ email, permissions });
}

export async function POST(request) {
  const { email } = await request.json();
  if (!email) {
    return Response.json({ message: "Email is required" }, { status: 400 });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }
  const permissions = getPermissionsForRoles(user.roles);
  return Response.json({ email, permissions });
}
