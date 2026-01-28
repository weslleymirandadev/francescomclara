import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userWithPlan = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          where: { 
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }] 
          },
          include: { plan: true }
        },
        parent: {
          include: {
            enrollments: {
              where: { 
                OR: [{ endDate: null }, { endDate: { gte: new Date() } }] 
              },
              include: { plan: true }
            }
          }
        }
      }
    });

    const activeEnrollment = userWithPlan?.enrollments[0] || userWithPlan?.parent?.enrollments[0];
    const planFeatures = (activeEnrollment?.plan?.features as string[]) || [];
    const hasAllAccess = planFeatures.includes('all_tracks');

    const tracks = await prisma.track.findMany({
      where: { active: true },
      include: {
        objective: { select: { id: true, name: true, icon: true, color: true } },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const filteredTracks = tracks.map((track: any) => {
      const hasAccess = hasAllAccess || planFeatures.includes(`track:${track.id}`);
      
      const totalLessonsCount = track.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);

      return {
        id: track.id,
        name: track.name,
        description: track.description,
        imageUrl: track.imageUrl,
        order: track.order,
        objective: track.objective,
        modules: track.modules.map((module: any) => ({
          ...module,
          isLocked: !hasAccess, 
        })),
        isLocked: !hasAccess,
        hasAccess: hasAccess,
        totalLessonsCount
      };
    });

    const progress = await prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true }
    });

    const completedLessonIds = progress.map((p: { lessonId: string }) => p.lessonId);

    return NextResponse.json({
      tracks: filteredTracks,
      hasActiveSubscription: !!activeEnrollment,
      completedLessonIds
    });

  } catch (error) {
    console.error('Error fetching study content:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}