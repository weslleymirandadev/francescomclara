import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/permissions";
import { redis } from "@/lib/redis";
import { getUserFeatures } from "@/lib/subscription";

const IGNORED_ROUTES = ["/api/mercado-pago", "/auth/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    IGNORED_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token?.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { status: true, banReason: true },
    });

    if (dbUser?.status === "BANNED") {
      if (!pathname.startsWith("/auth/login")) {
        const url = new URL("/auth/login", req.url);
        const reason = dbUser.banReason
          ? encodeURIComponent(dbUser.banReason)
          : "Suspensão por violação de regras";
        url.searchParams.set("error", `Sua conta está banida: ${reason}`);

        const response = NextResponse.redirect(url);

        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("__Secure-next-auth.session-token");

        return response;
      }
    }
  }

  const sensitiveRoutes = [
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/register",
    "/api/user/update",
    "/api/user/upload",
  ];

  if (sensitiveRoutes.some((route) => pathname.startsWith(route))) {
    const key = `rate-limit:${ip}:${pathname}`;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, 60);

    if (current > 5) {
      return new NextResponse(
        JSON.stringify({ error: "Muitas solicitações." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (
    pathname.startsWith("/moderacao") ||
    pathname.startsWith("/api/moderacao")
  ) {
    if (token?.role !== "ADMIN" && token?.role !== "MODERATOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
  }

  if (
    IGNORED_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const settings = await prisma.siteSettings.findFirst({
    where: { id: "settings" },
  });
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
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/support/webhooks");

  if (!isPublicRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    if (pathname.startsWith("/curso/")) {
      const trackId = pathname.split("/")[2];

      if (trackId) {
        const features = await getUserFeatures(token.sub!);

        // Verificar acesso a flashcards
        if (pathname.includes("/flashcards") && !features.canAccessFlashcards) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Verificar acesso a certificados
        if (pathname.includes("/certificates") && !features.hasCertificate) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Verificar acesso a suporte
        if (pathname.includes("/support") && !features.hasPrioritySupport) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        const hasSubscription = await hasActiveSubscription(token.sub!);
        const hasEnrollment = await hasTrackAccess(token.sub!, trackId);

        if (!hasSubscription && !hasEnrollment) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // Verificar features específicas nas APIs
    if (pathname.startsWith("/api/")) {
      const features = await getUserFeatures(token.sub!);

      // API de Flashcards
      if (
        pathname.startsWith("/api/flashcards") &&
        !features.canAccessFlashcards
      ) {
        return NextResponse.json(
          { error: "Flashcards não disponíveis no seu plano" },
          { status: 403 },
        );
      }

      // API de Certificados
      if (
        pathname.startsWith("/api/certificates") &&
        !features.hasCertificate
      ) {
        return NextResponse.json(
          { error: "Certificados não disponíveis no seu plano" },
          { status: 403 },
        );
      }

      // API de Suporte
      if (pathname.startsWith("/api/support") && !features.hasPrioritySupport) {
        return NextResponse.json(
          { error: "Suporte prioritário não disponível no seu plano" },
          { status: 403 },
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (webhook padrão)
     * - api/support/webhooks (seu webhook do whatsapp)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/webhooks|api/support/webhooks|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};

async function hasTrackAccess(
  userId: string,
  trackId: string,
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
      plan: {
        tracks: {
          some: {
            id: trackId,
          },
        },
      },
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
  });

  return !!enrollment;
}
