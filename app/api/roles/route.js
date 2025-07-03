let roles = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("role")) {
    const roleValue = searchParams.get("role");
    const { roles: rolesWithPerms } = await import("@/app/lib/roles");
    const found = rolesWithPerms.find((r) => r.value === roleValue);
    if (!found) {
      return new Response(JSON.stringify({ error: "Role not found" }), {
        status: 404,
      });
    }
    return Response.json(found.permissions || []);
  }
  return Response.json(roles);
}

export async function POST(request) {
  const body = await request.json();
  if (!body.name) {
    return new Response(JSON.stringify({ error: "Role name is required" }), {
      status: 400,
    });
  }
  const value = body.name.toLowerCase().replace(/\s+/g, "_");
  const label = body.name;
  if (!roles.some((r) => r.value === value)) {
    roles.push({ value, label });
  }
  return Response.json({ value, label }, { status: 201 });
}
