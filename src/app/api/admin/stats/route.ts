import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    // Total de usuários cadastrados
    const totalUsers = await prisma.user.count();

    // Usuários ativos (com enrollments ativos e pelo menos um pagamento aprovado)
    const activeUsers = await prisma.user.count({
      where: {
        AND: [
          {
            enrollments: {
              some: {
                OR: [
                  { endDate: null },
                  { endDate: { gte: now } }
                ]
              }
            }
          },
          {
            payments: {
              some: {
                status: 'APPROVED'
              }
            }
          }
        ]
      }
    });

    // Buscar todos os planos de assinatura ativos para fazer match
    const allPlans = await prisma.subscriptionPlan.findMany({
      where: {
        active: true
      }
    });

    // Buscar todos os pagamentos aprovados com seus planos
    const approvedPayments = await prisma.payment.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        subscriptionPlan: true,
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Contar usuários por tipo de plano (usando o pagamento mais recente de cada usuário)
    const usersByPlanType = {
      INDIVIDUAL: new Set<string>(),
      FAMILY: new Set<string>()
    };

    // Contar usuários por período
    const usersByPeriod = {
      MONTHLY: new Set<string>(),
      YEARLY: new Set<string>()
    };

    // Mapa para rastrear o plano mais recente de cada usuário
    const userLatestPlan = new Map<string, { type?: string; period?: string }>();

    approvedPayments.forEach(payment => {
      const userId = payment.userId;
      
      // Se o pagamento tem um plano associado diretamente
      if (payment.subscriptionPlan) {
        const plan = payment.subscriptionPlan;
        if (!userLatestPlan.has(userId)) {
          userLatestPlan.set(userId, {
            type: plan.type,
            period: plan.period
          });
        }
      } else {
        // Tentar fazer match com planos baseado no preço e metadata
        const metadata = payment.metadata as any;
        if (metadata && metadata.type === 'subscription') {
          // Tentar encontrar um plano que corresponda ao valor do pagamento
          const matchingPlan = allPlans.find(plan => {
            const planPrice = plan.discountEnabled && plan.discountPrice 
              ? plan.discountPrice 
              : plan.price;
            return Math.abs(planPrice - payment.amount) < 100; // Tolerância de 1 real
          });

          if (matchingPlan && !userLatestPlan.has(userId)) {
            userLatestPlan.set(userId, {
              type: matchingPlan.type,
              period: matchingPlan.period
            });
          }
        }
      }
    });

    // Contar usuários por tipo e período
    userLatestPlan.forEach((planInfo, userId) => {
      if (planInfo.type === 'INDIVIDUAL') {
        usersByPlanType.INDIVIDUAL.add(userId);
      } else if (planInfo.type === 'FAMILY') {
        usersByPlanType.FAMILY.add(userId);
      }

      if (planInfo.period === 'MONTHLY') {
        usersByPeriod.MONTHLY.add(userId);
      } else if (planInfo.period === 'YEARLY') {
        usersByPeriod.YEARLY.add(userId);
      }
    });

    // Receita do mês atual
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: startOfMonthISO
        }
      },
      _sum: {
        amount: true
      }
    });

    // Receita total (todos os pagamentos aprovados)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'APPROVED'
      },
      _sum: {
        amount: true
      }
    });

    // Calcular reembolsos para ajustar a receita
    const totalRefunds = await prisma.refund.aggregate({
      where: {
        status: {
          in: ['COMPLETED', 'APPROVED']
        }
      },
      _sum: {
        amount: true
      }
    });

    const monthlyRefunds = await prisma.refund.aggregate({
      where: {
        status: {
          in: ['COMPLETED', 'APPROVED']
        },
        createdAt: {
          gte: startOfMonthISO
        }
      },
      _sum: {
        amount: true
      }
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      plans: {
        individual: usersByPlanType.INDIVIDUAL.size,
        family: usersByPlanType.FAMILY.size,
        monthly: usersByPeriod.MONTHLY.size,
        yearly: usersByPeriod.YEARLY.size
      },
      revenue: {
        monthly: (monthlyRevenue._sum.amount || 0) - (monthlyRefunds._sum.amount || 0),
        total: (totalRevenue._sum.amount || 0) - (totalRefunds._sum.amount || 0)
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

