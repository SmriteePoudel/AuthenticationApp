import bcrypt from "bcryptjs";

const users = [];

export async function registerUser(email, password) {
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error("User already exists");
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ email, password: hashed });
  return { email };
}

export async function authenticateUser(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error("User not found");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }
  return { email };
}
