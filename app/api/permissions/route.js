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

const DEFAULT_PERMISSIONS = [
  "user.create",
  "user.read",
  "user.update",
  "user.delete",
];

let permissions = [...DEFAULT_PERMISSIONS];

export async function GET() {
  const allPermissions = Array.from(
    new Set([...DEFAULT_PERMISSIONS, ...permissions])
  );
  return Response.json(allPermissions);
}

export async function POST(request) {
  const body = await request.json();
  if (!body.name) {
    return new Response(
      JSON.stringify({ error: "Permission name is required" }),
      {
        status: 400,
      }
    );
  }
  const newPermission = body.name;
  if (!permissions.includes(newPermission)) {
    permissions.push(newPermission);
  }
  return Response.json({ name: newPermission }, { status: 201 });
}

export async function DELETE(request) {
  const { index } = await request.json();
  if (typeof index !== "number" || index < 0 || index >= permissions.length) {
    return new Response(JSON.stringify({ error: "Invalid index" }), {
      status: 400,
    });
  }

  if (DEFAULT_PERMISSIONS.includes(permissions[index])) {
    return new Response(
      JSON.stringify({ error: "Cannot delete default permission" }),
      { status: 403 }
    );
  }
  permissions.splice(index, 1);
  return Response.json({ success: true });
}

export async function PUT(request) {
  const { index, name } = await request.json();
  if (typeof index !== "number" || index < 0 || index >= permissions.length) {
    return new Response(JSON.stringify({ error: "Invalid index" }), {
      status: 400,
    });
  }
  if (!name) {
    return new Response(
      JSON.stringify({ error: "Permission name is required" }),
      { status: 400 }
    );
  }

  if (DEFAULT_PERMISSIONS.includes(permissions[index])) {
    return new Response(
      JSON.stringify({ error: "Cannot edit default permission" }),
      { status: 403 }
    );
  }
  permissions[index] = name;
  return Response.json({ name });
}

export async function GETPermissions() {
  return Response.json(permissions);
}

export async function GETPermissionsList() {
  return Response.json(permissions);
}
