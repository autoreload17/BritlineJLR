import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const isAuth = request.cookies.get("admin-auth")?.value === "true";

  // Redirect to login if accessing admin without auth (except login page)
  if (isAdminRoute && !isLoginRoute && !isAuth) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Redirect to admin if already logged in and trying to access login
  if (isLoginRoute && isAuth) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

