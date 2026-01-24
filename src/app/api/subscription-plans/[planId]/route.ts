import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Busca um plano de assinatura específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
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

    if (!plan) {
      return NextResponse.json(
        { error: "Plano de assinatura não encontrado" },
        { status: 404 }
      );
    }

    // Formatar resposta para compatibilidade com o frontend
    return NextResponse.json({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      price: plan.price || plan.monthlyPrice, // Compatibilidade com código antigo
      originalPrice: plan.price || plan.monthlyPrice,
      discountPrice: plan.discountPrice,
      discountEnabled: plan.discountEnabled,
      isBestValue: plan.isBestValue,
      type: plan.type,
      period: plan.period || 'MONTHLY', // Compatibilidade
      features: plan.features,
      tracks: plan.tracks
        .filter((spt: any) => spt.track)
        .map((spt: any) => ({
          id: spt.track!.id,
          name: spt.track!.name,
          description: spt.track!.description,
          imageUrl: spt.track!.imageUrl,
        })),
      active: plan.active,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      { error: "Erro ao buscar plano de assinatura" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Atualiza um plano de assinatura
 * Requer autenticação de admin
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
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
        { error: "Acesso negado. Apenas administradores podem atualizar planos." },
        { status: 403 }
      );
    }

    const { planId } = await params;
    const body = await request.json();

    const {
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      price, // Compatibilidade
      discountPrice,
      discountEnabled,
      type,
      period, // Compatibilidade
      features,
      trackIds,
      active,
      isBestValue,
    } = body;

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano de assinatura não encontrado" },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (monthlyPrice !== undefined) {
      updateData.monthlyPrice = Math.round(monthlyPrice);
      // Se yearlyPrice também foi fornecido, validar
      const finalYearlyPrice = yearlyPrice !== undefined ? Math.round(yearlyPrice) : existingPlan.yearlyPrice;
      const yearlyMonthlyPrice = Math.round(finalYearlyPrice / 12);
      if (yearlyMonthlyPrice >= updateData.monthlyPrice) {
        return NextResponse.json(
          { error: "O preço anual deve ser mais barato que o mensal (preço anual/12 < preço mensal)" },
          { status: 400 }
        );
      }
    }
    if (yearlyPrice !== undefined) {
      updateData.yearlyPrice = Math.round(yearlyPrice);
      // Se monthlyPrice também foi fornecido, validar
      const finalMonthlyPrice = monthlyPrice !== undefined ? Math.round(monthlyPrice) : existingPlan.monthlyPrice;
      const yearlyMonthlyPrice = Math.round(updateData.yearlyPrice / 12);
      if (yearlyMonthlyPrice >= finalMonthlyPrice) {
        return NextResponse.json(
          { error: "O preço anual deve ser mais barato que o mensal (preço anual/12 < preço mensal)" },
          { status: 400 }
        );
      }
    }
    // Compatibilidade com código antigo
    if (price !== undefined) {
      updateData.price = Math.round(price);
      // Se não tiver monthlyPrice definido, usar price como monthlyPrice
      if (updateData.monthlyPrice === undefined) {
        updateData.monthlyPrice = Math.round(price);
      }
    }
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Math.round(discountPrice) : null;
    if (discountEnabled !== undefined) updateData.discountEnabled = discountEnabled;
    if (isBestValue !== undefined) updateData.isBestValue = isBestValue;
    if (type !== undefined) {
      if (!['INDIVIDUAL', 'FAMILY'].includes(type)) {
        return NextResponse.json(
          { error: "Tipo deve ser INDIVIDUAL ou FAMILY" },
          { status: 400 }
        );
      }
      updateData.type = type;
    }
    if (period !== undefined) {
      if (!['MONTHLY', 'YEARLY'].includes(period)) {
        return NextResponse.json(
          { error: "Periodo deve ser MONTHLY ou YEARLY" },
          { status: 400 }
        );
      }
      updateData.period = period;
    }
    if (features !== undefined) updateData.features = features;
    if (active !== undefined) updateData.active = active;

    // Atualizar plano
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updateData,
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

    // Atualizar trilhas se fornecido
    if (trackIds !== undefined && Array.isArray(trackIds)) {
      // Remover todas as trilhas atuais
      await prisma.subscriptionPlanTrack.deleteMany({
        where: { subscriptionPlanId: planId },
      });

      // Adicionar novas trilhas
      if (trackIds.length > 0) {
        await prisma.subscriptionPlanTrack.createMany({
          data: trackIds.map((trackId: string) => ({
            subscriptionPlanId: planId,
            trackId,
          })),
        });
      }

      // Buscar plano atualizado com trilhas
      const updatedPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
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

      return NextResponse.json(updatedPlan);
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar plano de assinatura" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove um plano de assinatura
 * Requer autenticação de admin
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
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
        { error: "Acesso negado. Apenas administradores podem deletar planos." },
        { status: 403 }
      );
    }

    const { planId } = await params;

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano de assinatura não encontrado" },
        { status: 404 }
      );
    }

    // Deletar plano (cascata deleta os cursos relacionados)
    await prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({ success: true, message: "Plano deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { error: "Erro ao deletar plano de assinatura" },
      { status: 500 }
    );
  }
}

