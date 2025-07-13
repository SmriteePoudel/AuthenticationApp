"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [tab, setTab] = useState("user");
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
      localStorage.setItem("user", JSON.stringify(data.user));
      if (typeof window !== "undefined") {
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(data.user)
        )}; path=/; max-age=86400`;
      }
      let roles = [];
      console.log("DEBUG: Checking data.user.roles:", data?.user?.roles);
      console.log("DEBUG: Checking data.roles:", data?.roles);

      if (Array.isArray(data?.user?.roles)) {
        roles = data.user.roles;
        console.log("DEBUG: Using data.user.roles");
      } else if (Array.isArray(data?.roles)) {
        roles = data.roles;
        console.log("DEBUG: Using data.roles");
      } else {
        console.log("DEBUG: No roles found in response");
      }
      console.log("DEBUG: Full user data after login", data.user);
      console.log("DEBUG: roles after login", roles);
      console.log("DEBUG: roles length:", roles.length);
      console.log(
        "DEBUG: roles structure",
        roles.map((r) => ({ value: r.value, label: r.label, _id: r._id }))
      );
      console.log("DEBUG: Current tab:", tab);
      console.log("DEBUG: Raw data.user:", data.user);
      console.log("DEBUG: Raw data.user.roles:", data.user.roles);

      console.log("DEBUG: About to check for superadmin, roles array:", roles);
      console.log("DEBUG: Roles array type:", typeof roles);
      console.log("DEBUG: Roles array length:", roles.length);

      const isSuperadmin = roles.some((role) => {
        console.log("DEBUG: Checking role:", role);
        console.log("DEBUG: Role value:", role.value);
        console.log("DEBUG: Role label:", role.label);
        console.log("DEBUG: Role === 'superadmin':", role === "superadmin");
        console.log(
          "DEBUG: Role.value === 'superadmin':",
          role.value === "superadmin"
        );
        console.log(
          "DEBUG: Label check:",
          role.label && role.label.toLowerCase().includes("superadmin")
        );

        const result =
          role.value === "superadmin" ||
          role === "superadmin" ||
          (role.label && role.label.toLowerCase().includes("superadmin"));

        console.log("DEBUG: This role is superadmin:", result);
        return result;
      });
      console.log("DEBUG: Final isSuperadmin result:", isSuperadmin);

      // Hardcoded test for superadmin email
      const isSuperadminByEmail = data.user.email === "superadmin@example.com";
      console.log("DEBUG: isSuperadminByEmail check:", isSuperadminByEmail);

      // Use either role check or email check
      const finalIsSuperadmin = isSuperadmin || isSuperadminByEmail;
      console.log("DEBUG: Final superadmin decision:", finalIsSuperadmin);

      if (finalIsSuperadmin) {
        console.log("DEBUG: Redirecting to superadmin page");
        // Use window.location for more reliable redirect
        window.location.href = "/admin-dashboard/superadmin";
      } else if (
        roles.some(
          (role) =>
            role.value === "admin" ||
            (role.label && role.label.toLowerCase().includes("admin"))
        )
      ) {
        console.log("DEBUG: Redirecting to admin dashboard");
        router.push("/admin-dashboard");
      } else {
        console.log("DEBUG: Redirecting to user dashboard");
        router.push("/user-dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-l ${
            tab === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setTab("user")}
        >
          User Login
        </button>
        <button
          className={`flex-1 py-2 rounded-r ${
            tab === "superadmin"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setTab("superadmin")}
        >
          Superadmin Login
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {tab === "superadmin" ? "Superadmin Login" : "User Login"}
      </h1>
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
