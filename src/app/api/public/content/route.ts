import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      where: { active: true },
      include: {
        objective: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } }
          }
        }
      }
    });

    const sortedTracks = tracks.sort((a: any, b: any) => {
      const orderA = a.objective?.order ?? 0;
      const orderB = b.objective?.order ?? 0;
      return orderA - orderB;
    });

    return NextResponse.json({ tracks: sortedTracks });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar conteúdo" }, { status: 500 });
  }
}