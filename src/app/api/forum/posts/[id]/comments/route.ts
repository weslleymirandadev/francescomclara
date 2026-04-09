import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAutomationEmail } from "@/lib/mail";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();
    const userId = (session.user as any).id;

    const comment = await prisma.forumComment.create({
      data: {
        content: content,
        postId: id,
        authorId: userId,
      },
      include: {
        author: {
          select: { name: true, username: true, image: true },
        },
        post: {
          select: {
            title: true,
            author: {
              select: {
                id: true,
                email: true,
                notifForum: true,
              },
            },
          },
        },
      },
    });

    const postAuthor = comment.post.author;
    const postTitle = comment.post.title;

    if (
      postAuthor?.email &&
      postAuthor.notifForum &&
      postAuthor.id !== userId
    ) {
      const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const postLink = `${siteUrl}/forum/post/${id}`;

      await sendAutomationEmail(
        postAuthor.email,
        `Nova resposta em: ${postTitle} 💬`,
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #eee; border-radius: 24px;">
          <h2 style="color: #1a1a1a; font-weight: 900;">SALUT !</h2>
          <p style="color: #444; line-height: 1.6;">
            <strong>@${comment.author.username || comment.author.name}</strong> acabou de responder ao seu tópico:
            <br><span style="color: #666;">"${postTitle}"</span>
          </p>

          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0f172a; font-style: italic; color: #1a1a1a; margin: 20px 0;">
            "${content.substring(0, 150)}${content.length > 150 ? "..." : ""}"
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${postLink}"
                style="background-color: #0f172a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 900; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
              Ver resposta no Fórum
            </a>
          </div>
        </div>
        `,
      );
    }

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error("Erro ao comentar:", error.message);
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 },
    );
  }
}
