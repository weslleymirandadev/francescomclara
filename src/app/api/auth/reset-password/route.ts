import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) return NextResponse.json({ valid: false, error: "Token inválido ou expirado" });

  return NextResponse.json({ valid: true, email: user.email });
}

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) return NextResponse.json({ error: "Sessão expirada" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.userPassword.upsert({
        where: { userId: user.id },
        update: { hash: hashedPassword },
        create: { userId: user.id, hash: hashedPassword },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpires: null },
      }),
    ]);

    return NextResponse.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
  }
}