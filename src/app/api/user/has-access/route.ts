import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || typeof id !== 'string' || id.length > 50) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ hasAccess: false }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const now = new Date();

    const trackExists = await prisma.track.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!trackExists) {
      return NextResponse.json({ hasAccess: false, error: "Trilha não encontrada" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        trackId: id,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
    });
    
    const hasAccess = !!enrollment;
    
    console.log('Verificação de acesso à trilha:', {
      userId,
      trackId: id,
      hasAccess,
      enrollment: enrollment ? { id: enrollment.id, endDate: enrollment.endDate } : null
    });

    return NextResponse.json({ hasAccess });

  } catch (error) {
    console.error('Security Log - Access Check Error');
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}