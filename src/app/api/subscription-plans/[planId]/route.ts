import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Retorna um plano de assinatura
 * Por enquanto, retorna um plano padrão com todos os cursos públicos
 * Futuramente pode ser expandido para ter planos diferentes no banco
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    // Por enquanto, retornar um plano padrão
    // Futuramente, pode buscar planos do banco de dados
    if (planId === 'default' || planId === 'all-courses') {
      // Buscar todos os cursos públicos
      const courses = await prisma.course.findMany({
        where: { public: true },
        select: {
          id: true,
          title: true,
          price: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calcular preço total (ou usar um preço fixo para o plano)
      // Por enquanto, vamos usar um preço fixo de R$ 97,00 (9700 centavos)
      const planPrice = 9700; // R$ 97,00 em centavos

      return NextResponse.json({
        id: planId,
        name: 'Plano Completo',
        description: 'Acesso completo a todos os cursos da plataforma. Assinatura mensal recorrente.',
        price: planPrice,
        courses: courses.map(course => ({
          id: course.id,
          title: course.title,
          price: course.price || 0,
        })),
      });
    }

    // Se não for um plano conhecido, retornar 404
    return NextResponse.json(
      { error: "Plano de assinatura não encontrado" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      { error: "Erro ao buscar plano de assinatura" },
      { status: 500 }
    );
  }
}

