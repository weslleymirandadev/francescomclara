import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
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

    if (!flashcard) {
      return NextResponse.json(
        { error: "Flashcard não encontrado" },
        { status: 404 }
      );
    }

    if (flashcard.userId !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar flashcard" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { wasOk } = await request.json();

    const card = await prisma.flashcard.findUnique({
      where: { id }
    });

    if (!card) {
      return NextResponse.json({ error: "Flashcard não encontrado" }, { status: 404 });
    }

    if (card.userId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    let newLevel = card.level;
    let nextReview = new Date();

    if (wasOk) {
      newLevel = Math.min(card.level + 1, 5);
      
      const intervals = [0, 1, 3, 7, 14, 30]; 
      nextReview.setDate(nextReview.getDate() + intervals[newLevel]);
    } else {
      newLevel = 0;
      nextReview.setMinutes(nextReview.getMinutes() + 10);
    }

    const updatedCard = await prisma.flashcard.update({
      where: { id },
      data: {
        level: newLevel,
        nextReview: nextReview,
        lastResult: wasOk ? 'ok' : 'bad'
      }
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Erro ao atualizar flashcard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { error: "Flashcard não encontrado" },
        { status: 404 }
      );
    }

    if (existingFlashcard.userId !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    await prisma.flashcard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Flashcard deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json(
      { error: "Erro ao deletar flashcard" },
      { status: 500 }
    );
  }
}

