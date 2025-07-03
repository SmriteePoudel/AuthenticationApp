"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRolePage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: role }),
      });
      if (!res.ok) throw new Error("Failed to add role");
      router.push("/roles");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="bg-black p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Role</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Role Name"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-4 border p-2 rounded"
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-bl px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Role"}
          </button>
        </form>
      </div>
    </div>
  );
}
