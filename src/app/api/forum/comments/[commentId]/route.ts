import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { commentId } = await params;
    const { content } = await request.json();

    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const comment = await prisma.forumComment.update({
      where: { id: commentId, authorId: session.user.id },
      data: { content },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return new NextResponse("Erro ao editar", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { commentId } = await params;

    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    await prisma.forumComment.delete({
      where: { id: commentId, authorId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Erro ao deletar", { status: 500 });
  }
}
