import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    const lessons = await prisma.lesson.findMany({
      where: { 
        moduleId: moduleId,
        type: {
          not: 'FLASHCARD'
        }
      },
      select: { 
        id: true, 
        title: true,
        order: true 
      },
      orderBy: { 
        order: 'asc' 
      }
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Erro ao buscar aulas do módulo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}