import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAutomationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, captchaToken } = body;

    if (!name || !email || !captchaToken) {
      return NextResponse.json(
        { error: "Dados insuficientes ou CAPTCHA ausente" },
        { status: 400 },
      );
    }

    const captchaRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
      },
    );
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return NextResponse.json(
        { error: "Falha na validação do CAPTCHA" },
        { status: 400 },
      );
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: { name, email },
    });

    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "settings" },
      });

      if (settings?.welcomeBackMessage && settings?.welcomeMessage) {
        const success = await sendAutomationEmail(
          email,
          `Bem-vindo(a) ao ${settings.siteName || "Francês com Clara"}!`,
          settings.welcomeMessage,
        );

        if (success) {
          await prisma.user.update({
            where: { id: user.id },
            data: { welcomeEmailSent: true },
          });
        }
      }
    } catch (mailError) {
      console.error("Erro ao enviar e-mail de boas-vindas:", mailError);
    }

    return NextResponse.json(
      { message: "Usuário pronto para receber link!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
