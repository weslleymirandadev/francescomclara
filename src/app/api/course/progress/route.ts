import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Aqui usamos o email como âncora já que o ID da sessão está instável
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { lessonId, completed } = await req.json();

    // 1. Buscar o ID do utilizador pelo email primeiro
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Upsert: Se já existir atualiza, se não existir cria o progresso
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      },
      update: { completed: !!completed },
      create: {
        userId: user.id,
        lessonId: lessonId,
        completed: true
      }
    });

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("Erro no progresso:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}