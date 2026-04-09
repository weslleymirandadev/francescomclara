import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = params.id;
  const userId = session.user.id;

  const existingLike = await prisma.postLike.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existingLike) {
    await prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });
    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({
    data: { userId, postId },
  });

  return NextResponse.json({ liked: true });
}
