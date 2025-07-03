import { roles } from "@/app/lib/roles";

export async function GET() {
  return Response.json(roles);
}

export async function POST(request) {
  const body = await request.json();
  if (!body.name) {
    return new Response(JSON.stringify({ error: "Role name is required" }), {
      status: 400,
    });
  }
  const newRole = {
    value: body.name.toLowerCase().replace(/\s+/g, "_"),
    label: body.name,
    permissions: [],
  };
  roles.push(newRole);
  return Response.json(newRole, { status: 201 });
}
