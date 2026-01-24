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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { passwords: true }
    });

    if (!user?.passwords) {
      return NextResponse.json({ error: "Conta vinculada a provedor externo (Google/GitHub)" }, { status: 400 });
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.passwords.hash);
    if (!isCorrect) {
      return NextResponse.json({ error: "A senha atual está incorreta" }, { status: 400 });
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