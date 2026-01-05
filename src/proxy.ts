import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

// Rotas que devem ser ignoradas completamente pelo middleware
const IGNORED_ROUTES = [
  "/api/mercado-pago", // segurança extra
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ignorar webhooks e toda API (PROTEGE 100%)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2. Ignorar arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") // imagens, svg, etc
  ) {
    return NextResponse.next();
  }

  // 3. Ignorar webhooks explicitamente
  if (IGNORED_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. Autenticação
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isPublicApiRoute =
    (pathname === "/api/tracks") &&
    req.method === "GET";

  const isPublicRoute =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/assinar") || // Permitir acesso inicial, mas a página verifica autenticação
    pathname.startsWith("/api/public") ||
    pathname === "/" ||
    isPublicApiRoute;

  // 5. Proteger rotas autenticadas
  if (!isPublicRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (token) {
    // Verificar acesso a trilhas
    if (pathname.startsWith('/dashboard/trilhas/')) {
      const parts = pathname.split('/');
      const trackId = parts[3]; // Pega o ID da trilha da URL
      if (trackId && !await hasTrackAccess(token.sub!, trackId)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  
  }

  // 7. Permissões para /admin
  if (pathname.startsWith("/admin")) {
    if (!token || token.role != "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 8. Redirecionar usuário logado que tenta ir para login/registrar
  if (token && (pathname === "/auth/login" || pathname === "/auth/registrar")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

async function hasTrackAccess(userId: string, trackId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      trackId,
      OR: [
        { endDate: null }, // Acesso vitalício
        { endDate: { gte: new Date() } } // Acesso ativo
      ]
    }
  });
  return !!enrollment;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next|static|.*\\..*).*)",
  ],
};
