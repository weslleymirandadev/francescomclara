import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = session.user.id;

    const lastProgress = await prisma.lessonProgress.findFirst({
      where: { userId, completed: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        lesson: {
          include: { module: { select: { trackId: true } } }
        }
      }
    });

    const where: any = { userId };
    
    if (lastProgress?.lesson?.module?.trackId) {
      where.lesson = {
        module: { trackId: lastProgress.lesson.module.trackId }
      };
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        lesson: {
          select: {
            title: true,
            module: { select: { track: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar flashcards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { front, back, lessonId } = body;

    if (!front || !back) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        front,
        back,
        lessonId: lessonId || null,
      }
    });

    return NextResponse.json(flashcard, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}