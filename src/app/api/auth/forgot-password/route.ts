import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const baseUrl = request.nextUrl.origin;

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { passwords: true }
    });

    if (!user) {
      return NextResponse.json({ message: "Se o e-mail existir, um link será enviado." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    console.log("-----------------------------------------");
    console.log(`LINK PARA: ${email}`);
    console.log(`LINK DE RECUPERAÇÃO: ${baseUrl}/auth/resetar-senha?validate=${token}`);
    console.log("-----------------------------------------");

    return NextResponse.json({ message: "Link gerado" });
  } catch (error) {
    console.error("Erro na API de recuperação:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}