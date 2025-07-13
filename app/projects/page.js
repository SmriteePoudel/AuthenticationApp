"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/login");
        return;
      }
    }
  }, [router]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save task");
        return;
      }
      setForm({ title: "", description: "" });
      fetchTasks();
    } catch (err) {
      setError("Failed to save task");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <button
        className="mb-4 px-4 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600"
        onClick={() => {
          if (typeof window !== "undefined") {
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              const roles = user?.roles || [];
              const isSuperadmin = roles.some(
                (role) => role.value === "superadmin" || role === "superadmin"
              );
              const isAdmin = roles.some(
                (role) => role.value === "admin" || role === "admin"
              );
              const isSuperadminByEmail =
                user?.email === "superadmin@example.com";

              if (isSuperadmin || isSuperadminByEmail) {
                router.push("/admin-dashboard/superadmin");
              } else if (isAdmin) {
                router.push("/admin-dashboard");
              } else {
                router.push("/user-dashboard");
              }
            } catch (error) {
              router.push("/user-dashboard");
            }
          } else {
            router.push("/user-dashboard");
          }
        }}
      >
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md mb-8"
      >
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded text-black"
            rows={3}
          />
        </div>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 px-6 py-2 rounded text-white font-bold hover:bg-green-700"
            disabled={loading}
          >
            Save Task
          </button>
          <button
            type="button"
            className="bg-gray-600 px-6 py-2 rounded text-white font-bold hover:bg-gray-700"
            onClick={() => router.push("/user-dashboard")}
          >
            Back
          </button>
        </div>
      </form>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Tasks</h2>
        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : (
          <table className="min-w-full bg-gray-700 border border-gray-600">
            <thead className="bg-blue-700">
              <tr>
                <th className="py-2 px-4 border">Title</th>
                <th className="py-2 px-4 border">Description</th>
                <th className="py-2 px-4 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No tasks yet
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="py-2 px-4 border">{task.title}</td>
                    <td className="py-2 px-4 border">{task.description}</td>
                    <td className="py-2 px-4 border">
                      {new Date(task.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
