import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Lista todas as trilhas
 * Query params:
 * - active: boolean (opcional) - filtrar por trilhas ativas
 * - objective: TRAVEL | WORK | FAMILY | KNOWLEDGE (opcional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const objective = searchParams.get('objective');

    const where: any = {};

    if (active !== null) {
      where.active = active === 'true';
    }

    if (objective) {
      where.objective = objective;
    }

    const tracks = await prisma.track.findMany({
      where,
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
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trilhas" },
      { status: 500 }
    );
  }
}

/**
 * POST - Cria uma nova trilha
 * Requer autenticação de admin
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

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar trilhas." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      objective,
      imageUrl,
      active = true,
    } = body;

    // Validações
    if (!name || !description || !objective) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, description, objective" },
        { status: 400 }
      );
    }

    if (!['TRAVEL', 'WORK', 'FAMILY', 'KNOWLEDGE'].includes(objective)) {
      return NextResponse.json(
        { error: "Objetivo deve ser TRAVEL, WORK, FAMILY ou KNOWLEDGE" },
        { status: 400 }
      );
    }

    // Criar trilha
    const track = await prisma.track.create({
      data: {
        name,
        description,
        objective,
        imageUrl,
        active,
      },
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

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error("Error creating track:", error);
    return NextResponse.json(
      { error: "Erro ao criar trilha" },
      { status: 500 }
    );
  }
}

