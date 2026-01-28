import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Enrollment, Track } from "@prisma/client";

interface EnrollmentWithTrack extends Enrollment {
  track: Pick<Track, 'id' | 'name' | 'imageUrl'>;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      children: { select: { id: true, email: true, name: true } },
      enrollments: {
        where: { 
          OR: [
            { endDate: null }, 
            { endDate: { gte: new Date() } }
          ] 
        },
        include: {
          plan: true 
        }
      },
      payments: {
        where: { 
          status: { equals: "approved", mode: 'insensitive' }
        },
        include: { subscriptionPlan: true },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      parent: {
        include: {
          payments: {
            where: { 
              status: { equals: "approved", mode: 'insensitive' }, 
              subscriptionPlan: { type: "FAMILY" } 
            },
            include: { subscriptionPlan: true },
            take: 1
          }
        }
      }
    }
  });

  const activePlan = user?.payments[0]?.subscriptionPlan || user?.parent?.payments[0]?.subscriptionPlan;
  let tracks: any[] = [];
  if (activePlan) {
    const features = activePlan.features as string[] || [];
    if (features.includes('all_tracks')) {
      tracks = await prisma.track.findMany({ 
        where: { active: true },
        select: { id: true, name: true, imageUrl: true }
      });
    } else {
      const specificTrackIds = features
        .filter(f => f.startsWith('track:'))
        .map(f => f.split(':')[1]);
        
      tracks = await prisma.track.findMany({
        where: { id: { in: specificTrackIds } },
        select: { id: true, name: true, imageUrl: true }
      });
    }
  }

  return NextResponse.json({
    profile: {
      name: user?.name,
      email: user?.email,
      username: user?.username,
      level: user?.level,
      image: user?.image,
      bio: user?.bio
    },
    subscription: activePlan ? {
      name: activePlan.name,
      type: activePlan.type,
      features: activePlan.features
    } : null,
    family: {
      isParent: !!activePlan && activePlan.type === 'FAMILY' && !user?.parentId,
      members: user?.children || []
    },
    enrollments: tracks
  });
}