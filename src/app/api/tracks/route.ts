import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    const objectiveId = searchParams.get('objectiveId');

    const where: any = {};

    if (active !== null) {
      where.active = active === 'true';
    }

    if (objectiveId) {
      where.objectiveId = objectiveId;
    }

    const tracks = await prisma.track.findMany({
      where,
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
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json({ error: "Erro ao buscar trilhas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, objectiveId, imageUrl, active = true } = body;

    if (!name || !description || !objectiveId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, description, objectiveId" },
        { status: 400 }
      );
    }

    const track = await prisma.track.create({
      data: {
        name,
        description,
        active,
        imageUrl,
        objective: {
          connect: { id: objectiveId }
        }
      },
      include: { objective: true }
    });

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar trilha" }, { status: 500 });
  }
}