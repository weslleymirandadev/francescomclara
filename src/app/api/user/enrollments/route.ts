import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user with their enrollments and tracks
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        enrollments: {
          where: {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ],
            trackId: { not: undefined } // Garante que só retorne matrículas de trilhas
          },
          include: {
            track: {
              include: {
                modules: {
                  include: {
                    lessons: {
                      select: {
                        id: true,
                        title: true,
                        type: true,
                        order: true
                      },
                      orderBy: { order: 'asc' }
                    }
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const tracks = user.enrollments
      .filter((e: any) => e.track)
      .map((e: any) => e.track!);

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}