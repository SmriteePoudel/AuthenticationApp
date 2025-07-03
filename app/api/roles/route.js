let roles = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
];

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
  const value = body.name.toLowerCase().replace(/\s+/g, "_");
  const label = body.name;
  if (!roles.some((r) => r.value === value)) {
    roles.push({ value, label });
  }
  return Response.json({ value, label }, { status: 201 });
}
