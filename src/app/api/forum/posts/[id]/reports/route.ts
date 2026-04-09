import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const { reason } = await req.json();
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    if (!reason) {
      return new NextResponse("O motivo é obrigatório", { status: 400 });
    }

    await prisma.postReport.create({
      data: {
        reason: reason,
        post: { connect: { id: postId } },
        user: { connect: { id: (session.user as any).id } },
      },
    });

    return NextResponse.json({ message: "Reportado com sucesso" });
  } catch (error) {
    console.error("ERRO_REPORT_POST:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
