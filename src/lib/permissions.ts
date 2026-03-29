import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export function isAdmin(user: { role: UserRole } | undefined) {
  return user?.role === "ADMIN";
}

export function isModerator(user: { role: UserRole } | undefined) {
  return user?.role === "MODERATOR";
}

export function isStaff(user: { role: UserRole } | undefined) {
  return !!user && (user.role === "ADMIN" || user.role === "MODERATOR");
}

export async function hasTrackAccess(userId: string, trackId: string) {
  const now = new Date();
  
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      trackId,
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    },
  });

  if (enrollment) return true;

  return hasActiveSubscription(userId);
}

export async function hasLessonAccess(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { trackId: true } } },
  });

  return lesson?.module ? hasTrackAccess(userId, lesson.module.trackId) : false;
}

export async function hasModuleAccess(userId: string, moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { trackId: true },
  });

  return module ? hasTrackAccess(userId, module.trackId) : false;
}

export async function canViewPost(userId: string | null, postId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { trackId: true },
  });

  if (!post) return false;
  if (!post.trackId) return true;
  if (!userId) return false;

  return hasTrackAccess(userId, post.trackId);
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      parentId: true,
      payments: {
        where: {
          status: { in: ['APPROVED', 'authorized', 'AUTHORIZED'] },
          subscriptionPlanId: { not: null }
        },
        take: 1
      }
    }
  });

  if (user?.payments.length && user.payments.length > 0) return true;

  if (user?.parentId) {
    const parent = await prisma.user.findUnique({
      where: { id: user.parentId },
      select: {
        payments: {
          where: {
            status: { in: ['APPROVED', 'authorized', 'AUTHORIZED'] },
            subscriptionPlanId: { not: null },
            plan: { type: 'FAMILY' }
          },
          take: 1
        }
      }
    });

    if (parent?.payments.length && parent.payments.length > 0) return true;
  }

  return false;
}

export async function getPlanFeatures(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      payments: {
        where: { status: 'APPROVED' },
        include: { plan: true },
        take: 1
      },
      parent: {
        include: {
          payments: {
            where: { status: 'APPROVED', plan: { type: 'FAMILY' } },
            include: { plan: true },
            take: 1
          }
        }
      }
    }
  });

  const payment = user?.payments?.[0] || user?.parent?.payments?.[0];
  const plan = payment?.plan;

  return {
    hasActivePlan: !!payment,
    planType: plan?.type ?? "FREE",
    hasForumAccess: !!payment,
  };
}

export async function canModeratePost(user: { id: string; role: UserRole } | undefined, postId: string) {
  if (!user) return false;
  if (isAdmin(user) || isModerator(user)) return true;

  return false;
}

export async function canCreatePost(userId: string | null, trackId?: string | null) {
  if (!userId) return false;

  if (!trackId) return true; // criar post público

  if (trackId) return hasTrackAccess(userId, trackId);

  return false;
}

//
// --------------------- SUBSCRIPTION ACCESS ---------------------
//

/**
 * Verifica se o usuário tem um plano de assinatura ativo.
 * Um plano é considerado ativo se:
 * - Existe um Payment com status 'APPROVED' ou 'authorized' E subscriptionPlanId não nulo
 * - E o usuário tem pelo menos uma matrícula ativa (enrollment não expirado)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const now = new Date();
  
  // Verificar se existe um pagamento de assinatura aprovado
  // Um payment de assinatura tem subscriptionPlanId não nulo
  const activePayment = await prisma.payment.findFirst({
    where: {
      userId,
      status: {
        in: ['APPROVED', 'authorized', 'AUTHORIZED']
      },
      subscriptionPlanId: {
        not: null
      }
    }
  });

  if (!activePayment) return false;

  // Verificar se o usuário tem pelo menos uma matrícula ativa (enrollment não expirado)
  // Isso confirma que o acesso foi realmente concedido
  const activeEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      OR: [
        { endDate: null }, // Acesso vitalício
        { endDate: { gte: now } } // Acesso ativo (não expirado)
      ]
    }
  });

  return !!activeEnrollment;
}
