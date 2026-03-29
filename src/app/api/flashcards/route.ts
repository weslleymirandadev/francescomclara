import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface SimpleProgress {
  lessonId: string;
}

interface FlashcardTemplate {
  id: string;
  front: string;
  back: string;
  lessonId: string;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = session.user.id;
    const now = new Date();

    const userProgress: SimpleProgress[] = await prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true }
    });
    
    const completedIds = userProgress.map((p) => p.lessonId);

    const availableTemplates: FlashcardTemplate[] = await prisma.flashcardTemplate.findMany({
      where: {
        OR: [
          { relatedLessonId: null },
          { relatedLessonId: { in: completedIds } }
        ]
      }
    });

    await Promise.all(
      availableTemplates.map((template: FlashcardTemplate) =>
        prisma.flashcard.upsert({
          where: {
            id: `${userId}_${template.id}` 
          },
          create: {
            id: `${userId}_${template.id}`,
            userId,
            front: template.front,
            back: template.back,
            lessonId: template.lessonId,
            level: 0,
            nextReview: now
          },
          update: {} 
        })
      )
    );

    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId,
        nextReview: { lte: now }
      },
      include: {
        lesson: { select: { title: true } }
      },
      orderBy: [{ level: 'asc' }, { nextReview: 'asc' }],
      take: 20
    });

    return NextResponse.json(flashcards.sort(() => Math.random() - 0.5));
  } catch (error) {
    console.error("Erro Flashcards:", error);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
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