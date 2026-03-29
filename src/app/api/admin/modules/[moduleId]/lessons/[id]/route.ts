import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;

    if (!lessonId) {
      return NextResponse.json({ error: "ID da lição não fornecido" }, { status: 400 });
    }

    const body = await req.json();
    const { title, content, type, isPremium } = body;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      const updatedLesson = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          type,
          isPremium,
          content: content 
        }
      });

      if (type === 'FLASHCARD' && Array.isArray(content)) {
        await tx.flashcardTemplate.deleteMany({
          where: { lessonId: lessonId }
        });

        if (content.length > 0) {
          await tx.flashcardTemplate.createMany({
            data: content.map((card: any) => ({
              front: card.front,
              back: card.back,
              lessonId: lessonId,
              relatedLessonId: card.relatedLessonId || null 
            }))
          });
        }
      }

      return updatedLesson;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ ERRO AO ATUALIZAR LIÇÃO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}