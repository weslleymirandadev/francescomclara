import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    const comment = await prisma.forumComment.create({
      data: {
        content: content,
        postId: id,
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error("Erro ao comentar:", error.message);
    return NextResponse.json({ error: "Erro ao criar comentário" }, { status: 500 });
  }
}