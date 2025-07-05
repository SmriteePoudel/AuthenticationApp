import "@/app/lib/mongoose";
import Role from "@/app/lib/models/Role";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("role")) {
    const roleValue = searchParams.get("role");
    const found = await Role.findOne({ value: roleValue });
    if (!found) {
      return new Response(JSON.stringify({ error: "Role not found" }), {
        status: 404,
      });
    }
    return Response.json(found.permissions || []);
  }
  const roles = await Role.find();
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
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  let role = await Role.findOne({ value });
  if (!role) {
    role = await Role.create({ value, label, permissions });
  } else {
    // Optionally update permissions if role already exists
    role.permissions = permissions;
    await role.save();
  }
  return Response.json(
    { value: role.value, label: role.label, permissions: role.permissions },
    { status: 201 }
  );
}
