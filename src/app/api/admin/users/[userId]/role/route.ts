import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { role } = await req.json();
    
    const { userId } = await params;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro na API de Role:", error);
    return NextResponse.json({ error: "Falha ao atualizar role" }, { status: 500 });
  }
}