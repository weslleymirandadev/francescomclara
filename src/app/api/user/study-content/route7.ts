import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const hasSubscription = await hasActiveSubscription(userId);

    const tracks = await prisma.track.findMany({
      where: {
        active: true
      },
      include: {
        objective: { select: { name: true, description: true } },
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

    const filteredTracks = tracks.map((track: any) => {
      const hasAccess = track.enrollments.length > 0 || hasSubscription;
      
      if (!hasAccess && !hasSubscription) {
        const freeLessonsCount = track.modules.reduce((sum: number, m: any) => 
          sum + m.lessons.filter((l: any) => !l.isPremium).length, 0
        );
        const totalLessonsCount = track.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);

        return {
          id: track.id,
          name: track.name,
          description: track.description,
          imageUrl: track.imageUrl,
          order: track.order,
          objective: track.objective,
          modules: track.modules.map((module: any) => {
            const freeLessons = module.lessons.filter((lesson: any) => !lesson.isPremium);
            const hasFreeLessons = freeLessons.length > 0;
            
            return {
              ...module,
              lessons: freeLessons.slice(0, 3),
              isLocked: module.isPremium || !hasFreeLessons,
              isPremium: module.isPremium
            };
          }),
          isLocked: true,
          freeLessonsCount,
          totalLessonsCount
        };
      }

      return {
        id: track.id,
        name: track.name,
        description: track.description,
        imageUrl: track.imageUrl,
        order: track.order,
        objective: track.objective,
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
