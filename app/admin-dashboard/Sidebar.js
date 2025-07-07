"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home (Admin)", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Settings", href: "/settings" },
  { label: "Roles", href: "/roles" },
  { label: "Users", href: "/users" },
  { label: "Permissions", href: "/permissions" },
  { label: "Logout" },
];

function getUserRole() {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const roles = user?.user?.roles || user?.roles || [];
    if (roles.some((role) => role.value === "admin")) return "admin";
    return "user";
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  let filteredNavItems = navItems;
  if (role === "user") {
    filteredNavItems = navItems.filter(
      (item) => item.label === "Projects" || item.label === "Logout"
    );
  }

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <nav className="space-y-2">
        {filteredNavItems.map((item) =>
          item.label === "Logout" ? (
            <button
              key="logout"
              onClick={handleLogout}
              className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700`}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                pathname === item.href ? "bg-gray-700" : ""
              }`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
