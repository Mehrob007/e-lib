import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const payload = decodeJwt(token);

      if (payload.role !== "Admin" || payload.role !== "Superadmin") {
        console.log("Access denied: User is not an Admin");
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Invalid token:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Настройка путей, на которых будет срабатывать Middleware
export const config = {
  matcher: [
    "/admin/:path*", // Все вложенные пути админки
  ],
};
