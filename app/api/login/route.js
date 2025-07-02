import { authenticateUser } from "../../lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const user = await authenticateUser(email, password);

    return Response.json({ message: "Login successful", user });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 401 });
  }
}
