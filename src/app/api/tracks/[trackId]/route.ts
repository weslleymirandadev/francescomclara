import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Busca uma trilha específica
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trilha" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Atualiza uma trilha
 * Requer autenticação de admin
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> }
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
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar trilhas." },
        { status: 403 }
      );
    }

    const { trackId } = await params;
    const body = await request.json();

    const {
      name,
      description,
      objective,
      imageUrl, 
      active,
    } = body;

    // Verificar se a trilha existe
    const existingTrack = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!existingTrack) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (objective !== undefined) {
      if (!['TRAVEL', 'WORK', 'FAMILY', 'KNOWLEDGE'].includes(objective)) {
        return NextResponse.json(
          { error: "Objetivo deve ser TRAVEL, WORK, FAMILY ou KNOWLEDGE" },
          { status: 400 }
        );
      }
      updateData.objective = objective;
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (active !== undefined) updateData.active = active;

    // Atualizar trilha
    const track = await prisma.track.update({
      where: { id: trackId },
      data: updateData,
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error updating track:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar trilha" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove uma trilha
 * Requer autenticação de admin
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> }
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
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem deletar trilhas." },
        { status: 403 }
      );
    }

    const { trackId } = await params;

    // Verificar se a trilha existe
    const existingTrack = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!existingTrack) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    // Deletar trilha (cascata deleta os cursos relacionados)
    await prisma.track.delete({
      where: { id: trackId },
    });

    return NextResponse.json({ success: true, message: "Trilha deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { error: "Erro ao deletar trilha" },
      { status: 500 }
    );
  }
}

