import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await props.params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, username: true, image: true, id: true },
        },
        comments: {
          include: {
            author: {
              select: { name: true, username: true, image: true, id: true },
            },
            _count: {
              select: { likes: true },
            },
            likes: session?.user?.id
              ? {
                  where: { userId: session.user.id },
                  select: { userId: true },
                }
              : false,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("ERRO NO BANCO:", error.message);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "401" }, { status: 401 });

    const { id } = await params;

    await prisma.forumPost.delete({
      where: {
        id,
        authorId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERRO NA API:", error);
    return NextResponse.json({ error: "Erro ao eliminar" }, { status: 500 });
  }
}
