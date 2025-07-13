import { NextResponse } from "next/server";
import { permissions as allPermissions } from "./lib/roles.js";

const routePermissions = [
  { path: "/admin-dashboard", required: ["role_read"] },
  { path: "/projects", required: ["user_read"] },
  { path: "/settings", required: ["user_update"] },
  { path: "/roles", required: ["role_read"] },
  { path: "/users", required: ["user_read"] },
  { path: "/permissions", required: ["permission_read"] },
  { path: "/user-dashboard", required: ["user_read"] },
  { path: "/about", required: ["synchronize"] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get("user");
  let roles = [];
  let permissions = [];
  let isSuperAdmin = false;

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      roles = user?.user?.roles || user?.roles || [];
      permissions = user?.user?.permissions || user?.permissions || [];
      isSuperAdmin = roles.some(
        (role) => role.value === "superadmin" || role === "superadmin"
      );
    } catch (e) {
      isSuperAdmin = false;
    }
  }

  for (const route of routePermissions) {
    if (pathname.startsWith(route.path)) {
      if (isSuperAdmin) return NextResponse.next();
      if (!permissions.some((p) => route.required.includes(p))) {
        // Redirect based on route
        if (route.path === "/admin-dashboard" || route.path === "/about") {
          return NextResponse.redirect(new URL("/user-dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/roles/:path*",
    "/users/:path*",
    "/permissions/:path*",
    "/user-dashboard/:path*",
    "/about/:path*",
  ],
};
