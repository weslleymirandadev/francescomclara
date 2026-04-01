import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search") || "";

  try {
    const posts = await prisma.forumPost.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              {
                author: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            ],
          }
        : {},
      include: {
        author: {
          select: { name: true, username: true, image: true },
        },
        _count: {
          select: { comments: true },
        },
        comments: {
          take: 2,
          orderBy: { createdAt: "desc" },
          include: { author: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("ERRO:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sessão sem ID de usuário" },
        { status: 401 },
      );
    }
    9;
    const { title, content, lessonId, attachmentUrl } = await request.json();

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        attachmentUrl: attachmentUrl || null,
        author: {
          connect: { id: session.user.id },
        },
        ...(lessonId &&
          lessonId !== "" && {
            lesson: {
              connect: { id: lessonId },
            },
          }),
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("ERRO COMPLETO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
