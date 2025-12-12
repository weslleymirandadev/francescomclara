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
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                price: true,
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
      price: plan.discountEnabled && plan.discountPrice ? plan.discountPrice : plan.price,
      originalPrice: plan.price,
      discountPrice: plan.discountPrice,
      discountEnabled: plan.discountEnabled,
      type: plan.type,
      period: plan.period,
      features: plan.features,
      courses: plan.courses
        .filter(spc => spc.course)
        .map(spc => ({
          id: spc.course!.id,
          title: spc.course!.title,
          price: spc.course!.price || 0,
          description: spc.course!.description,
          imageUrl: spc.course!.imageUrl,
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
      price,
      discountPrice,
      discountEnabled,
      type,
      period,
      features,
      courseIds,
      active,
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
    if (price !== undefined) updateData.price = Math.round(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Math.round(discountPrice) : null;
    if (discountEnabled !== undefined) updateData.discountEnabled = discountEnabled;
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
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Atualizar cursos se fornecido
    if (courseIds !== undefined && Array.isArray(courseIds)) {
      // Remover todos os cursos atuais
      await prisma.subscriptionPlanCourse.deleteMany({
        where: { subscriptionPlanId: planId },
      });

      // Adicionar novos cursos
      if (courseIds.length > 0) {
        await prisma.subscriptionPlanCourse.createMany({
          data: courseIds.map((courseId: string) => ({
            subscriptionPlanId: planId,
            courseId,
          })),
        });
      }

      // Buscar plano atualizado com cursos
      const updatedPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  imageUrl: true,
                  price: true,
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

