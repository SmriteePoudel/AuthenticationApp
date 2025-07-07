import db from "../../../lib/mongoose.js";
import { User } from "../../../models/index.js";
import { authenticateUser } from "../../lib/auth.js";

export async function POST(request) {
  await db;
  const { email, password } = await request.json();

  try {
    const user = await authenticateUser(email, password);
    return Response.json({ message: "Login successful", user });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 401 });
  }
}
