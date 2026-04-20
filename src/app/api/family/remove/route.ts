import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { parentId: true },
    });

    if (currentUser?.parentId) {
      return NextResponse.json(
        { error: "Apenas o titular do plano pode gerenciar membros." },
        { status: 403 },
      );
    }

    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "ID do membro é obrigatório" },
        { status: 400 },
      );
    }

    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { parentId: true },
    });

    if (!member || member.parentId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para remover este usuário." },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { parentId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
