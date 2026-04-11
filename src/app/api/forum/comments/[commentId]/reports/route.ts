import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { commentId } = await params;
    const { reason } = await request.json();

    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const report = await prisma.commentReport.create({
      data: {
        reason,
        commentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    return new NextResponse("Erro ao denunciar", { status: 500 });
  }
}
