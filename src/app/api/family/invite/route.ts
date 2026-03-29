import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { email: inviteEmail } = await req.json();

    const owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        payments: {
          where: { status: "APPROVED" },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        children: true
      }
    });

    const activePlan = owner?.payments[0]?.plan;

    if (activePlan?.type !== "FAMILY") {
      return NextResponse.json({ error: "O seu plano não permite dependentes" }, { status: 403 });
    }

    const MAX_MEMBERS = 3; 
    if (owner.children.length >= MAX_MEMBERS) {
      return NextResponse.json({ error: "Limite de membros atingido" }, { status: 400 });
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: inviteEmail.toLowerCase().trim() }
    });

    if (!invitedUser) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (invitedUser.parentId) {
      return NextResponse.json({ error: "Este utilizador já pertence a uma família" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: invitedUser.id },
      data: { parentId: owner.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no convite de família:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}