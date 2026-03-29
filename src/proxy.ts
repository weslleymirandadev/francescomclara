import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/permissions";
import { redis } from "@/lib/redis";

const IGNORED_ROUTES = ["/api/mercado-pago"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const sensitiveRoutes = [
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/register",
    "/api/user/update",
    "/api/user/upload",
  ];

  if (sensitiveRoutes.some(route => pathname.startsWith(route))) {
    const key = `rate-limit:${ip}:${pathname}`;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, 60);

    if (current > 5) {
      return new NextResponse(JSON.stringify({ error: "Muitas solicitações." }), { 
        status: 429, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/moderacao") || pathname.startsWith("/api/moderacao")) {
    if (token?.role !== "ADMIN" && token?.role !== "MODERATOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
  }

  if (IGNORED_ROUTES.some(route => pathname.startsWith(route)) || 
      pathname.startsWith("/_next") || 
      pathname.includes(".")) {
    return NextResponse.next();
  }

  const settings = await prisma.siteSettings.findFirst({ where: { id: "settings" } });
  const isAdmin = token?.role === "ADMIN";

  if (settings?.maintenanceMode && !isAdmin) {
    if (pathname !== "/manutencao" && !pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/manutencao", req.url));
    }
  }

  const isPublicRoute = 
    pathname.startsWith("/auth") || 
    pathname.startsWith("/api/auth") ||
    pathname === "/" || 
    pathname === "/manutencao" ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/webhooks");

  if (!isPublicRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    if (pathname.startsWith('/curso/')) {
      const trackId = pathname.split('/')[2];
      
      if (trackId) {
        const hasSubscription = await hasActiveSubscription(token.sub!);
        
        const hasEnrollment = await hasTrackAccess(token.sub!, trackId);

        if (!hasSubscription && !hasEnrollment) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    }
    
    if (pathname.startsWith('/flashcards') || pathname.startsWith('/forum')) {
      const userHasAnyEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: token.sub,
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        }
      });

      if (!userHasAnyEnrollment) {
        return NextResponse.redirect(new URL('/assinar', req.url));
      }
    }
  }

  return NextResponse.next();
}

async function hasTrackAccess(userId: string, trackId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
      plan: {
        tracks: {
          some: {
            id: trackId
          }
        }
      },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    }
  });

  return !!enrollment;
}