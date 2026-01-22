import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const posts = await prisma.forumPost.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Erro ao buscar posts do usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}