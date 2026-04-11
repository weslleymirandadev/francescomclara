import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAutomationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { lessonId, lessonTitle, moduleId, lessonType } = await req.json();

    const track = await prisma.track.findFirst({
      where: { modules: { some: { id: moduleId } } },
      select: { id: true },
    });

    const subscribers = await prisma.user.findMany({
      where: { notifLessons: true },
      select: { email: true, name: true },
    });

    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const isFlashcard = lessonType === "FLASHCARD";
    const trackSlug = track?.id || "geral";

    const finalLink = isFlashcard
      ? `${siteUrl}/flashcards`
      : `${siteUrl}/curso/${trackSlug}`;

    const emailSubject = isFlashcard
      ? `Novos Flashcards: ${lessonTitle} 🧠`
      : `Nova Aula: ${lessonTitle} 🇫🇷`;

    for (const user of subscribers) {
      if (user.email) {
        await sendAutomationEmail(
          user.email,
          emailSubject,
          `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #eee; border-radius: 24px;">
            <h2 style="color: #1a1a1a; font-weight: 900;">SALUT, ${user.name?.split(" ")[0] || "estudante"}!</h2>
            <p style="color: #444; line-height: 1.6;">
              ${
                isFlashcard
                  ? "Novos cartões de memorização foram adicionados para você praticar!"
                  : "Tem conteúdo fresquinho na plataforma esperando por você."
              }
            </p>
            <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #f59e0b; font-weight: bold; color: #1a1a1a;">
              ${isFlashcard ? "BARALHO" : "AULA"}: ${lessonTitle}
            </p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${finalLink}"
                 style="background-color: ${isFlashcard ? "#8b5cf6" : "#f59e0b"}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 900; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
                ${isFlashcard ? "PRATICAR AGORA 🧠" : "COMEÇAR AULA 🇫🇷"}
              </a>
            </div>
          </div>
          `,
        );
      }
    }

    return NextResponse.json({ success: true, count: subscribers.length });
  } catch (error) {
    console.error("Erro ao notificar:", error);
    return NextResponse.json({ error: "Erro ao notificar" }, { status: 500 });
  }
}
