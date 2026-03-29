import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado: Requer privilégios de Admin" }, { status: 403 });
    }

    const { role } = await req.json();
    const { userId } = await params;

    const validRoles: UserRole[] = ["USER", "ADMIN", "MODERATOR"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Cargo inválido" }, { status: 400 });
    }

    if (userId === (session.user as any).id && role !== "ADMIN") {
      return NextResponse.json({ error: "Não podes remover o teu próprio cargo de Admin" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: { id: true, email: true, role: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro na API de Role:", error);
    return NextResponse.json({ error: "Falha ao processar atualização" }, { status: 500 });
  }
}