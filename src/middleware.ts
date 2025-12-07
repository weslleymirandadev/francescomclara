// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/curso/") ||           // páginas públicas de curso
    pathname.startsWith("/jornada/") ||         // páginas públicas de jornada
    pathname.startsWith("/api/public") ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon");

  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Somente admin / moderator acessa /admin
  if (pathname.startsWith("/admin")) {
    if (!token || !["ADMIN", "MODERATOR"].includes(token.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Users logados não podem ir para /login /register
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next|static|.*\\..*).*)",
  ],
};
