import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        enrollments: {
          include: {
            track: {
              include: {
                modules: { orderBy: { order: 'asc' } }
              }
            }
          }
        }
      }
    });

    if (!user) return new NextResponse('User not found', { status: 404 });

    const tracks = user.enrollments
      .filter((e: any) => e.track)
      .map((e: any) => ({
        ...e.track,
        cefrLevel: e.track.modules[0]?.cefrLevel || 'A1'
      }));
      
    return NextResponse.json({ tracks });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}