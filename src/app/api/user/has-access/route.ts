import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ hasAccess: false });
  }

  try {
    const userId = session.user.id;
    const now = new Date();

    // Verifica se o usuário tem acesso ao curso
    // endDate pode ser null (acesso vitalício) ou maior que hoje (acesso ativo)
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: id,
        OR: [
          { endDate: null }, // Acesso vitalício
          { endDate: { gte: now } } // Acesso ativo (não expirado)
        ]
      },
    });
    
    const hasAccess = !!enrollment;
    
    console.log('Verificação de acesso ao curso:', {
      userId,
      courseId: id,
      hasAccess,
      enrollment: enrollment ? { id: enrollment.id, endDate: enrollment.endDate } : null
    });

    return NextResponse.json({ hasAccess });

  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking access' },
      { status: 500 }
    );
  }
}