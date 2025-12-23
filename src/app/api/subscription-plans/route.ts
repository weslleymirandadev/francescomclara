import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Lista todos os planos de assinatura
 * Query params:
 * - active: boolean (opcional) - filtrar por planos ativos
 * - type: INDIVIDUAL | FAMILY (opcional)
 * - period: MONTHLY | YEARLY (opcional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const type = searchParams.get('type');
    const period = searchParams.get('period');

    const where: any = {};

    if (active !== null) {
      where.active = active === 'true';
    }

    if (type) {
      where.type = type;
    }

    if (period) {
      where.period = period;
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      include: {
        tracks: {
          include: {
            track: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { period: 'asc' },
        { price: 'asc' },
      ],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planos de assinatura" },
      { status: 500 }
    );
  }
}

/**
 * POST - Cria um novo plano de assinatura
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

    // Verificar se é admin (você pode ajustar essa lógica conforme sua necessidade)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar planos." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      discountPrice,
      discountEnabled = false,
      type,
      period,
      features,
      trackIds = [],
    } = body;

    // Validações
    if (!name || !price || !type || !period) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, price, type, period" },
        { status: 400 }
      );
    }

    if (!['INDIVIDUAL', 'FAMILY'].includes(type)) {
      return NextResponse.json(
        { error: "Tipo deve ser INDIVIDUAL ou FAMILY" },
        { status: 400 }
      );
    }

    if (!['MONTHLY', 'YEARLY'].includes(period)) {
      return NextResponse.json(
        { error: "Periodo deve ser MONTHLY ou YEARLY" },
        { status: 400 }
      );
    }

    // Criar plano com trilhas
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price: Math.round(price), // Garantir que está em centavos
        discountPrice: discountPrice ? Math.round(discountPrice) : null,
        discountEnabled,
        type,
        period,
        features: features || [],
        tracks: {
          create: trackIds.map((trackId: string) => ({
            trackId,
          })),
        },
      },
      include: {
        tracks: {
          include: {
            track: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { error: "Erro ao criar plano de assinatura" },
      { status: 500 }
    );
  }
}

