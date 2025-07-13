"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Project", href: "/projects" },
  { label: "Setting", href: "/settings" },
  { label: "Roles", href: "/roles" },
  { label: "Users", href: "/users" },
  { label: "Permission", href: "/permissions" },
  { label: "Logout", href: "/login" },
];

export default function UserDashboard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(user);
      const roles = parsed?.roles || [];
      console.log("DEBUG: roles in user-dashboard", roles);
      if (
        roles.some(
          (role) => role.value === "superadmin" || role === "superadmin"
        )
      ) {
        router.replace("/admin-dashboard/superadmin");
        return;
      }
      if (roles.some((role) => role.value === "admin")) {
        router.replace("/admin-dashboard");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-gray-800 text-white p-4 min-h-screen">
          <h2 className="text-xl font-bold mb-6">User</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-10">
          <h1 className="text-3xl font-bold mb-4">User Page</h1>
          <p className="text-lg">
            Welcome! You are logged in as a user. You can access Projects, but
            other sections are restricted.
          </p>
        </main>
      </div>
    </div>
  );
}
