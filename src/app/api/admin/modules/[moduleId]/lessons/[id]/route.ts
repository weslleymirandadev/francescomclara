import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        order: true,
        isPremium: true,
        moduleId: true
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lição não encontrada" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR LIÇÃO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    // Validação específica para lições do tipo READING com sentences
    if (type === 'READING' && content?.sentences) {
      if (!Array.isArray(content.sentences)) {
        return NextResponse.json({ 
          error: "O campo 'sentences' deve ser um array" 
        }, { status: 400 });
      }

      // Validar estrutura de cada sentence
      for (let i = 0; i < content.sentences.length; i++) {
        const sentence = content.sentences[i];
        if (!sentence.frase || typeof sentence.frase !== 'string') {
          return NextResponse.json({ 
            error: `A frase ${i + 1} deve ter um campo 'frase' válido` 
          }, { status: 400 });
        }
        if (!sentence.traducao || typeof sentence.traducao !== 'string') {
          return NextResponse.json({ 
            error: `A frase ${i + 1} deve ter um campo 'traducao' válido` 
          }, { status: 400 });
        }
        if (!sentence.explicacao || typeof sentence.explicacao !== 'string') {
          return NextResponse.json({ 
            error: `A frase ${i + 1} deve ter um campo 'explicacao' válido` 
          }, { status: 400 });
        }
      }
    }

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