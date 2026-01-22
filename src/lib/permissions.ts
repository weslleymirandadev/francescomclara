import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export function isAdmin(user: { role: UserRole } | undefined) {
  return !!user && user.role === "ADMIN";
}

export function isModerator(user: { role: UserRole } | undefined) {
  return !!user && user.role === "MODERATOR";
}

export function isStaff(user: { role: UserRole } | undefined) {
  return !!user && (user.role === "ADMIN" || user.role === "MODERATOR");
}

//
// --------------------- TRACK ACCESS ---------------------
//

/**
 * Verifica se o usuário tem acesso válido (não-expirado) a uma track.
 * Usa a tabela Enrollment (que contém startDate e endDate).
 */
export async function hasTrackAccess(userId: string, trackId: string) {
  const now = new Date();
  // Para trilhas: endDate pode ser null (acesso vitalício) ou maior que hoje (acesso ativo)
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      trackId,
      OR: [
        { endDate: null }, // Acesso vitalício
        { endDate: { gte: now } } // Acesso ativo (não expirado)
      ]
    },
  });

  return !!enrollment;
}

/**
 * Verifica se o usuário tem acesso à lesson consultando o track pai através do module.
 */
export async function hasLessonAccess(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      module: {
        select: {
          trackId: true,
        },
      },
    },
  });

  if (!lesson || !lesson.module) return false;
  return hasTrackAccess(userId, lesson.module.trackId);
}

//
// --------------------- MODULE ACCESS ---------------------
//

/**
 * Verifica se o usuário tem acesso ao module consultando o track pai.
 */
export async function hasModuleAccess(userId: string, moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      trackId: true,
    },
  });

  if (!module) return false;
  return hasTrackAccess(userId, module.trackId);
}

//
// --------------------- FORUM (POSTS) ---------------------
//

/**
 * Verifica se um post do fórum (ForumPost) é público ou vinculado a uma trilha
 * e se o usuário tem acesso a esse contexto.
 */
export async function canViewPost(userId: string | null, postId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { trackId: true },
  });

  if (!post) return false;

  // público (nenhum contexto)
  if (!post.trackId) return true;

  // post da trilha: checar enrollment válido
  if (post.trackId) {
    if (!userId) return false;
    const ok = await hasTrackAccess(userId, post.trackId);
    return ok;
  }

  return false;
}

/**
 * Mesma regra para responder: precisa conseguir ver o post primeiro.
 */
export async function canReplyPost(userId: string | null, postId: string) {
  if (!userId) return false;
  return canViewPost(userId, postId);
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
