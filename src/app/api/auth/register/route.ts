import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, captchaToken } = body;

    if (!name || !email || !captchaToken) {
      return NextResponse.json({ error: "Dados insuficientes ou CAPTCHA ausente" }, { status: 400 });
    }

    const captchaRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return NextResponse.json({ error: "Falha na validação do CAPTCHA" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    await prisma.user.create({
      data: { name, email }
    });

    return NextResponse.json({ message: "Usuário pronto para receber link!" }, { status: 201 });

  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}