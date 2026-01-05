import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Busca um flashcard específico
 */
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

    // Verificar se o flashcard pertence ao usuário
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

/**
 * PATCH - Atualiza um flashcard
 * Body: { front?: string, back?: string }
 */
export async function PATCH(
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
    const body = await request.json();
    const { front, back } = body;

    // Verificar se o flashcard existe e pertence ao usuário
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

    // Preparar dados de atualização
    const updateData: any = {};
    if (front !== undefined) updateData.front = front;
    if (back !== undefined) updateData.back = back;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo fornecido para atualização" },
        { status: 400 }
      );
    }

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar flashcard" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove um flashcard
 */
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

    // Verificar se o flashcard existe e pertence ao usuário
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

