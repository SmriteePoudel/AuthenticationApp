"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      alert("Login successful");

      localStorage.setItem("user", JSON.stringify(data));

      if (typeof window !== "undefined") {
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(data)
        )}; path=/; max-age=86400`;
      }

      let roles = [];
      if (Array.isArray(data?.user?.roles)) {
        roles = data.user.roles;
      } else if (Array.isArray(data?.roles)) {
        roles = data.roles;
      }
      console.log("Roles after login:", roles, "Raw data:", data);
      if (roles.some((role) => role.value === "admin")) {
        router.push("/admin-dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}
