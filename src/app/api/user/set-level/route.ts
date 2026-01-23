import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CEFRLevel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { level } = await req.json();

    if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
      return NextResponse.json({ error: "Nível inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        _count: { select: { completedLessons: true } } 
      }
    });

    const completedCount = user?._count.completedLessons || 0;

    const requirements: Record<string, number> = {
      "A2": 20,
      "B1": 50,
      "B2": 100,
      "C1": 200
    };

    if (requirements[level] && completedCount < requirements[level]) {
      return NextResponse.json({ 
        error: `Requisitos não atingidos. Precisas de ${requirements[level]} lições para o nível ${level}.` 
      }, { status: 403 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { level: level as CEFRLevel }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao definir nível:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}