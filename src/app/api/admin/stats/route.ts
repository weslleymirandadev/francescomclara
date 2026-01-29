import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { Payment, SubscriptionPlan } from '@prisma/client';

type PaymentWithPlan = Payment & {
  subscriptionPlan: { type: string; monthlyPrice: number; yearlyPrice: number } | null;
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

    const [totalUsers, recentStudentsRaw, activeUsers, canceledSubscriptions] = await Promise.all([
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
            orderBy: { createdAt: 'desc' },
            select: {
              plan: { select: { name: true } },
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          enrollments: { some: { OR: [{ endDate: null }, { endDate: { gte: now } }] } },
          payments: { some: { status: 'APPROVED' } }
        }
      }),
      prisma.enrollment.count({ 
        where: { 
          endDate: { lt: now } 
        } 
      }),
    ]);

    const churnRate = totalUsers > 0 ? ((canceledSubscriptions / totalUsers) * 100).toFixed(1) : "0.0";

    const allPlans = await prisma.subscriptionPlan.findMany({ 
      where: { active: true } 
    }) as SubscriptionPlan[];
    
    const approvedPayments = await prisma.payment.findMany({
      where: { status: 'APPROVED' },
      include: { 
        subscriptionPlan: { 
          select: { 
            type: true, 
            monthlyPrice: true, 
            yearlyPrice: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    }) as PaymentWithPlan[];

    const stats = {
      individual: new Set<string>(),
      family: new Set<string>(),
      monthly: new Set<string>(),
      yearly: new Set<string>()
    };

    approvedPayments.forEach((payment) => {
      const plan = payment.subscriptionPlan;
      
      if (plan) {
        if (plan.type === 'INDIVIDUAL') stats.individual.add(payment.userId);
        else if (plan.type === 'FAMILY') stats.family.add(payment.userId);

        if (payment.amount >= (plan.yearlyPrice * 0.8)) {
          stats.yearly.add(payment.userId);
        } else {
          stats.monthly.add(payment.userId);
        }
      } else {
        const metadata = payment.metadata as any;
        if (metadata?.type === 'subscription') {
          const matchingPlan = allPlans.find((p: SubscriptionPlan) => {
            const mPrice = p.monthlyPrice ?? 0;
            const yPrice = p.yearlyPrice ?? 0;

            return Math.abs(mPrice - payment.amount) < 500 || 
                  Math.abs(yPrice - payment.amount) < 500;
          });

          if (matchingPlan) {
            if (matchingPlan.type === 'INDIVIDUAL') stats.individual.add(payment.userId);
            else if (matchingPlan.type === 'FAMILY') stats.family.add(payment.userId);
            
            const planYearlyPrice = matchingPlan.yearlyPrice ?? 0;
            
            if (Math.abs(planYearlyPrice - payment.amount) < 500) {
              stats.yearly.add(payment.userId);
            } else {
              stats.monthly.add(payment.userId);
            }
          }
        }
      }
    });

    const [monthlySum, totalSum, refundsSum, monthlyRefundsSum] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'APPROVED', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.refund.aggregate({ where: { status: { in: ['COMPLETED', 'APPROVED'] } }, _sum: { amount: true } }),
      prisma.refund.aggregate({ where: { status: { in: ['COMPLETED', 'APPROVED'] }, createdAt: { gte: startOfMonth } }, _sum: { amount: true } })
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers
      },
      churnRate,
      plans: {
        individual: stats.individual.size,
        family: stats.family.size,
        monthly: stats.monthly.size,
        yearly: stats.yearly.size
      },
      revenue: {
        monthly: (monthlySum._sum.amount || 0) - (monthlyRefundsSum._sum.amount || 0),
        total: (totalSum._sum.amount || 0) - (refundsSum._sum.amount || 0)
      },
      recentStudents: recentStudentsRaw.map((s: any) => ({
        id: s.id,
        name: s.name || "Sem nome",
        createdAt: s.createdAt,
        planType: s.enrollments[0]?.plan?.name || "Sem Plano",
        enrollments: s.enrollments[0] ? [{
          ...s.enrollments[0],
          track: {
            name: s.enrollments[0].plan?.name || "Sem Plano"
          }
        }] : []
      }))
    });

  } catch (error: any) {
    console.error('ADMIN_STATS_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}