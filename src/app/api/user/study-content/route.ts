import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/permissions";

/**
 * GET - Retorna conteúdo de estudo baseado no status de assinatura do usuário
 * - Se tiver plano ativo: retorna todas as trilhas e conteúdo completo
 * - Se não tiver plano: retorna apenas conteúdo gratuito (isPremium = false)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const hasSubscription = await hasActiveSubscription(userId);

    // Buscar trilhas ativas
    const tracks = await prisma.track.findMany({
      where: {
        active: true
      },
      include: {
        objective: true,
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                isPremium: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          where: {
            userId,
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        }
      },
      orderBy: { order: 'asc' },
    });

    // Filtrar conteúdo baseado no status de assinatura
    const filteredTracks = tracks.map((track: any) => {
      const hasAccess = track.enrollments.length > 0 || hasSubscription;
      
      // Se não tem acesso e não é assinante, mostrar apenas módulos/lições gratuitas
      if (!hasAccess && !hasSubscription) {
        const freeLessonsCount = track.modules.reduce((sum: number, m: any) => 
          sum + m.lessons.filter((l: any) => !l.isPremium).length, 0
        );
        const totalLessonsCount = track.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);

        return {
          ...track,
          modules: track.modules.map((module: any) => {
            const freeLessons = module.lessons.filter((lesson: any) => !lesson.isPremium);
            const hasFreeLessons = freeLessons.length > 0;
            
            return {
              ...module,
              lessons: freeLessons.slice(0, 3), // Limitar a 3 lições gratuitas por módulo
              isLocked: module.isPremium || !hasFreeLessons,
              isPremium: module.isPremium
            };
          }),
          isLocked: true,
          freeLessonsCount,
          totalLessonsCount
        };
      }

      // Se tem acesso ou é assinante, mostrar tudo
      return {
        ...track,
        modules: track.modules.map((module: any) => ({
          ...module,
          lessons: module.lessons,
          isLocked: false,
          isPremium: false
        })),
        isLocked: false,
        hasAccess: true
      };
    });

    // Buscar progresso do usuário
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true
      },
      select: {
        lessonId: true
      }
    });

    const completedLessonIds = new Set(progress.map((p: { lessonId: string }) => p.lessonId));

    return NextResponse.json({
      tracks: filteredTracks,
      hasActiveSubscription: hasSubscription,
      completedLessonIds: Array.from(completedLessonIds)
    });

  } catch (error) {
    console.error('Error fetching study content:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching study content' },
      { status: 500 }
    );
  }
}
