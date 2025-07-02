import { registerUser } from "../../lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const user = await registerUser(email, password);
    return Response.json({ message: "Registration successful", user });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
