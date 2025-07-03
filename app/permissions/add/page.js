"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPermissionPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e, action = "save") => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: role }),
      });
      if (!res.ok) throw new Error("Failed to add permission");
      if (action === "save") {
        router.push("/permissions");
      } else if (action === "saveAndCreate") {
        setRole("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    router.push("/permissions");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <div className="bg-black p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Permission</h2>
        <form onSubmit={(e) => handleSubmit(e, "save")}>
          <input
            type="text"
            placeholder="Permission Name"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-4 border p-2 rounded"
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700 w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="bg-green-600 text-white px-2 py-2 rounded hover:bg-green-700 w-full"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "saveAndCreate")}
            >
              {loading ? "Saving..." : "Save and Create"}
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-2 py-2 rounded hover:bg-gray-700 w-full"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
