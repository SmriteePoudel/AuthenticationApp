import { roles } from "@/app/lib/roles";

export async function GET() {
  return Response.json(roles);
}
