"use client";
import AccessDenied from "../components/AccessDenied";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (
          user &&
          user.user &&
          user.user.roles &&
          user.user.roles.length > 0
        ) {
          if (user.user.roles.some((role) => role.value === "admin")) {
            setIsAdmin(true);
            return;
          }
        }
      } catch {}
    }
    setIsAdmin(false);
  }, []);

  if (isAdmin === null) return null;
  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p className="text-gray-700">This is the About page of My Auth App.</p>
    </div>
  );
}
