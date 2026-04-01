import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "401" }, { status: 401 });

    const { commentId } = await params;
    const userId = session.user.id;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    }

    await prisma.commentLike.create({
      data: { userId, commentId },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar like" },
      { status: 500 },
    );
  }
}
