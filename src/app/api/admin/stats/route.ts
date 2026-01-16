import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Payment, SubscriptionPlan } from '@prisma/client';

interface RecentStudentRaw {
  id: string;
  name: string | null;
  createdAt: Date;
  enrollments: { track: { name: string } | null }[];
}

type PaymentWithPlan = Payment & {
  subscriptionPlan: { type: string; period: string } | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    const user = session?.user as { role?: string } | undefined;

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    const [totalUsers, recentStudentsRaw, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          enrollments: {
            take: 1,
            select: { track: { select: { name: true } } }
          }
        }
      }) as Promise<RecentStudentRaw[]>,
      prisma.user.count({
        where: {
          enrollments: { some: { OR: [{ endDate: null }, { endDate: { gte: now } }] } },
          payments: { some: { status: 'APPROVED' } }
        }
      })
    ]);

    const allPlans = await prisma.subscriptionPlan.findMany({ where: { active: true } }) as SubscriptionPlan[];
    
    const approvedPayments = await prisma.payment.findMany({
      where: { status: 'APPROVED' },
      include: { subscriptionPlan: { select: { type: true, period: true } } },
      orderBy: { createdAt: 'desc' }
    }) as PaymentWithPlan[];

    const usersByPlanType = { INDIVIDUAL: new Set<string>(), FAMILY: new Set<string>() };
    const usersByPeriod = { MONTHLY: new Set<string>(), YEARLY: new Set<string>() };
    const processedUsers = new Set<string>();

    approvedPayments.forEach((payment) => {
      if (processedUsers.has(payment.userId)) return;

    approvedPayments.forEach((payment: any) => {
      const userId = payment.userId;
      
      // Se o pagamento tem um plano associado diretamente
      if (payment.subscriptionPlan) {
        const { type, period } = payment.subscriptionPlan;
        if (type === 'INDIVIDUAL') usersByPlanType.INDIVIDUAL.add(payment.userId);
        else if (type === 'FAMILY') usersByPlanType.FAMILY.add(payment.userId);
        if (period === 'MONTHLY') usersByPeriod.MONTHLY.add(payment.userId);
        else if (period === 'YEARLY') usersByPeriod.YEARLY.add(payment.userId);
        processedUsers.add(payment.userId);
      } else {
        // Tentar fazer match com planos baseado no preço e metadata
        const metadata = payment.metadata as any;
        if (metadata && metadata.type === 'subscription') {
          // Tentar encontrar um plano que corresponda ao valor do pagamento
            const matchingPlan = allPlans.find((plan: any) => {
            const planPrice = plan.discountEnabled && plan.discountPrice 
              ? plan.discountPrice 
              : plan.price;
            return Math.abs(planPrice - payment.amount) < 100; // Tolerância de 1 real
          });
          if (matchingPlan) {
            if (matchingPlan.type === 'INDIVIDUAL') usersByPlanType.INDIVIDUAL.add(payment.userId);
            else if (matchingPlan.type === 'FAMILY') usersByPlanType.FAMILY.add(payment.userId);
            if (matchingPlan.period === 'MONTHLY') usersByPeriod.MONTHLY.add(payment.userId);
            else if (matchingPlan.period === 'YEARLY') usersByPeriod.YEARLY.add(payment.userId);
            processedUsers.add(payment.userId);
          }
        }
      }
    });

    const [monthlyRevenue, totalRevenue, totalRefunds, monthlyRefunds] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'APPROVED', createdAt: { gte: startOfMonthISO } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.refund.aggregate({ where: { status: { in: ['COMPLETED', 'APPROVED'] } }, _sum: { amount: true } }),
      prisma.refund.aggregate({ where: { status: { in: ['COMPLETED', 'APPROVED'] }, createdAt: { gte: startOfMonthISO } }, _sum: { amount: true } })
    ]);

    return NextResponse.json({
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
      },
      recentStudents: recentStudentsRaw.map((s) => ({
        id: s.id,
        name: s.name || "Sem nome",
        createdAt: s.createdAt,
        planType: s.enrollments[0]?.track?.name || "N/A"
      }))
    });

  } catch (error: any) {
    console.error('DETAILED_ADMIN_STATS_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}