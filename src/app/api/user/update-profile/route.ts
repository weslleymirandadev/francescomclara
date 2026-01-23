import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { name, username, bio } = body;

    if (username) {
      if (!/^[a-z0-9_]+$/.test(username)) {
        return NextResponse.json({ error: "Username inválido (use apenas letras, números e _)" }, { status: 400 });
      }
      if (username.length < 3 || username.length > 20) {
        return NextResponse.json({ error: "Username deve ter entre 3 e 20 caracteres" }, { status: 400 });
      }
    }

    if (name && name.length > 50) {
      return NextResponse.json({ error: "Nome demasiado longo" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name: name?.trim(),
        username: username?.toLowerCase().trim(),
        bio: bio?.substring(0, 160)
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Este username já está em uso" }, { status: 400 });
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 });
  }
}