import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        enrollments: {
          include: {
            track: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                modules: { 
                  orderBy: { order: 'asc' },
                  select: { cefrLevel: true }
                }
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
        id: e.track.id,
        name: e.track.name,
        description: e.track.description,
        imageUrl: e.track.imageUrl,
        cefrLevel: e.track.modules[0]?.cefrLevel || 'A1'
      }));
      
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Erro ao listar trilhas do usuário:", error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}