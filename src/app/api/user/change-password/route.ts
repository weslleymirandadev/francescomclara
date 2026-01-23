import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    if (newPassword.length < 8 || newPassword.length > 50) {
      return NextResponse.json({ error: "A nova senha deve ter entre 8 e 50 caracteres" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { passwords: true }
    });

    if (!user?.passwords) {
      return NextResponse.json({ error: "Conta vinculada a provedor externo (Google/GitHub)" }, { status: 400 });
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.passwords.hash);
    if (!isCorrect) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwords.hash);
    if (isSamePassword) {
      return NextResponse.json({ error: "A nova senha não pode ser igual à anterior" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.userPassword.update({
      where: { userId: user.id },
      data: { hash: hashedNewPassword }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar alteração" }, { status: 500 });
  }
}