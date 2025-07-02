"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Home (Admin)", href: "/" },

  { label: "Projects", href: "/projects" },
  { label: "Settings", href: "/settings" },
  { label: "Roles", href: "/roles" },
  { label: "Users", href: "/users" },
  { label: "Permissions", href: "/permissions" },

  { label: "Logout" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout(e) {
    e.preventDefault();
    // Clear token or any auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  }

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <nav className="space-y-2">
        {navItems.map((item) =>
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
