import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/api/roles") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/permissions")
  ) {
    const userCookie = request.cookies.get("user");
    let isAdmin = false;
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        const roles = user?.user?.roles || user?.roles || [];
        isAdmin = roles.some((role) => role.value === "admin");
      } catch (e) {
        isAdmin = false;
      }
    }
    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return NextResponse.redirect(new URL("/user-dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/api/roles/:path*",
    "/api/users/:path*",
    "/api/permissions/:path*",
  ],
};
