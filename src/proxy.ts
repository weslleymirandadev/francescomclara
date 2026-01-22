import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/permissions";

const IGNORED_ROUTES = [
  "/api/mercado-pago",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Usar a variável IGNORED_ROUTES aqui (isso remove o erro do TS)
  if (IGNORED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Ignorar toda API (exceto as que você quer processar)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 3. Ignorar arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") 
  ) {
    return NextResponse.next();
  }

  const settings = await prisma.siteSettings.findFirst({ where: { id: "settings" } });
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === "ADMIN";

  // 4. LÓGICA DE MANUTENÇÃO
  if (settings?.maintenanceMode && !isAdmin) {
    const isMaintenancePage = pathname === "/manutencao";
    const isAuthRoute = pathname.startsWith("/auth");

    // Se não for admin e não estiver em rota permitida, vai para manutenção
    if (!isMaintenancePage && !isAuthRoute) {
      return NextResponse.redirect(new URL("/manutencao", req.url));
    }
    
    // Se estiver na página de manutenção ou auth, permite o acesso
    if (isMaintenancePage || isAuthRoute) {
      return NextResponse.next();
    }
  }

  const isPublicApiRoute = (pathname === "/api/tracks") && req.method === "GET";

  const isPublicRoute =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/assinar") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/public") ||
    pathname === "/" ||
    pathname === "/manutencao" ||
    isPublicApiRoute;

  // 5. Proteger rotas autenticadas
  if (!isPublicRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (token) {
    if (pathname.startsWith('/dashboard/trilhas/')) {
      const parts = pathname.split('/');
      const trackId = parts[3];
      if (trackId && !await hasTrackAccess(token.sub!, trackId)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (pathname === '/flashcards' || pathname.startsWith('/flashcards/')) {
      const hasSubscription = await hasActiveSubscription(token.sub!);
      if (!hasSubscription) {
        return NextResponse.redirect(new URL('/assinar', req.url));
      }
    }

    if (pathname === '/minha-trilha' || pathname.startsWith('/minha-trilha/')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token || token.role != "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (token && (pathname === "/auth/login" || pathname === "/auth/registrar")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

async function hasTrackAccess(userId: string, trackId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      trackId,
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    }
  });
  return !!enrollment;
}