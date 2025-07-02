import { roles } from "@/app/lib/roles";

let users = [];
let nextId = 1;

export async function GET() {
  return Response.json(users);
}

export async function POST(request) {
  const data = await request.json();
  const newUser = {
    id: nextId++,
    name: data.name,
    email: data.email,
    phone: data.phone,
    roles: Array.isArray(data.roles) ? data.roles : [data.roles],
  };
  users.push(newUser);
  return Response.json(newUser);
}
