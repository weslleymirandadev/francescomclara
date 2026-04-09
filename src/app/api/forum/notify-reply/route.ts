import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAutomationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { postId, commentAuthorName, commentContent } = await req.json();

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: { select: { email: true, name: true, notifForum: true } },
      },
    });

    if (post?.author?.email && post.author.notifForum) {
      const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const postLink = `${siteUrl}/forum/post/${postId}`;

      await sendAutomationEmail(
        post.author.email,
        `Nova resposta no seu post: ${post.title} 💬`,
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #eee; border-radius: 24px;">
          <h2 style="color: #1a1a1a;">Salut, ${post.author.name?.split(" ")[0]}!</h2>
          <p><strong>${commentAuthorName}</strong> acabou de responder ao seu tópico no fórum.</p>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 12px; font-style: italic; color: #475569; margin: 20px 0;">
            "${commentContent.substring(0, 100)}${commentContent.length > 100 ? "..." : ""}"
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${postLink}"
               style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
              VER RESPOSTA COMPLETA
            </a>
          </div>
        </div>
        `,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao notificar resposta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
