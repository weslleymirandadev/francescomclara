import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { name, username, bio } = await request.json();

    if (username && !/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username inválido (use apenas letras, números e _)" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name,
        username,
        bio
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Este username já está em uso" }, { status: 400 });
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 });
  }
}