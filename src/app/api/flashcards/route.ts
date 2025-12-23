import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Lista todos os flashcards do usuário autenticado
 * Query params:
 * - lessonId: string (opcional) - filtrar por lição específica
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const where: any = {
      userId: user.id,
    };

    if (lessonId) {
      where.lessonId = lessonId;
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                track: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Erro ao buscar flashcards" },
      { status: 500 }
    );
  }
}

/**
 * POST - Cria um novo flashcard
 * Body: { front: string, back: string, lessonId?: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { front, back, lessonId } = body;

    // Validações
    if (!front || !back) {
      return NextResponse.json(
        { error: "Campos obrigatórios: front, back" },
        { status: 400 }
      );
    }

    // Se lessonId for fornecido, verificar se a lição existe
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return NextResponse.json(
          { error: "Lição não encontrada" },
          { status: 404 }
        );
      }
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: user.id,
        front,
        back,
        lessonId: lessonId || null,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                track: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(flashcard, { status: 201 });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json(
      { error: "Erro ao criar flashcard" },
      { status: 500 }
    );
  }
}

