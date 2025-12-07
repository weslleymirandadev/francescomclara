import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";

export function isAdmin(user: { role: UserRole } | undefined) {
  return !!user && user.role === "ADMIN";
}

export function isInstructor(user: { role: UserRole } | undefined) {
  return !!user && user.role === "INSTRUCTOR";
}

export function isModerator(user: { role: UserRole } | undefined) {
  return !!user && user.role === "MODERATOR";
}

export function isStaff(user: { role: UserRole } | undefined) {
  return !!user && (user.role === "ADMIN" || user.role === "INSTRUCTOR" || user.role === "MODERATOR");
}

//
// --------------------- COURSE ACCESS ---------------------
//

/**
 * Verifica se o usuário tem acesso válido (não-expirado) a um course.
 * Usa a tabela Enrollment (que contém startDate e endDate).
 */
export async function hasCourseAccess(userId: string, courseId: string) {
  const now = new Date();
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      endDate: { gt: now },
    },
  });

  return !!enrollment;
}

//
// --------------------- LESSON ACCESS ---------------------
//

/**
 * Verifica se o usuário tem acesso à lesson consultando o course pai.
 */
export async function hasLessonAccess(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson || !lesson.module) return false;
  return hasCourseAccess(userId, lesson.module.courseId);
}

//
// --------------------- INSTRUCTOR PERMISSIONS ---------------------
//

/**
 * Instrutor pode editar/gerenciar curso se for owner (course.instructorId).
 * Admin pode sempre.
 */
export async function canManageCourse(user: { id: string; role: UserRole } | undefined, courseId: string) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!isInstructor(user)) return false;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  return !!course && course.instructorId === user.id;
}

//
// --------------------- FORUM (POSTS) ---------------------
//

/**
 * Verifica se um post do fórum (ForumPost) é público ou vinculado a um curso/jornada
 * e se o usuário tem acesso a esse contexto.
 */
export async function canViewPost(userId: string | null, postId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { cursoId: true, jornadaId: true },
  });

  if (!post) return false;

  // público (nenhum contexto)
  if (!post.cursoId && !post.jornadaId) return true;

  // post do curso: checar enrollment válido
  if (post.cursoId) {
    if (!userId) return false;
    const ok = await hasCourseAccess(userId, post.cursoId);
    return ok;
  }

  // post da jornada: CURRENTLY treated as public because schema lacks Journey enrollments
  if (post.jornadaId) {
    // TODO: implementar controle de acesso a jornadas (criar JourneyEnrollment ou JourneyAccess)
    return true;
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

/**
 * Moderar posts: MODERATOR ou ADMIN ou o próprio instructor/owner do course
 */
export async function canModeratePost(user: { id: string; role: UserRole } | undefined, postId: string) {
  if (!user) return false;
  if (isAdmin(user) || isModerator(user)) return true;

  // instructor do curso pode moderar posts daquele curso
  if (isInstructor(user)) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { cursoId: true },
    });
    if (!post?.cursoId) return false;

    const course = await prisma.course.findUnique({
      where: { id: post.cursoId },
      select: { instructorId: true },
    });

    return !!course && course.instructorId === user.id;
  }

  return false;
}

export async function canCreatePost(userId: string | null, cursoId?: string | null) {
  if (!userId) return false;

  if (!cursoId) return true; // criar post público

  if (cursoId) return hasCourseAccess(userId, cursoId);

  return false;
}

