"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AdminDashboard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user"));
      const roles = user?.roles || [];
      if (!roles.some((role) => role.value === "admin")) {
        router.replace("/user-dashboard");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg">
          Welcome! You are logged in as an admin. All sidebar links are
          accessible.
        </p>
      </main>
    </div>
  );
}
