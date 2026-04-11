import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search") || "";
  const cursor = searchParams.get("cursor");
  const limit = 10;

  try {
    const posts = await prisma.forumPost.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { author: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      include: {
        author: { select: { name: true, username: true, image: true } },
        attachments: true,
        _count: {
          select: {
            comments: true,
            postLikes: true,
          },
        },
        comments: {
          take: 2,
          orderBy: {
            likes: {
              _count: "desc",
            },
          },
          include: {
            author: { select: { username: true, image: true } },
            _count: {
              select: { likes: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json({ posts: [], nextCursor: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, lessonId, attachments } = body;

    console.log("Recebido:", {
      title,
      lessonId,
      totalAttachments: attachments?.length,
    });

    const post = await prisma.forumPost.create({
      data: {
        title,
        content: typeof content === "string" ? { text: content } : content,
        author: {
          connect: { id: session.user.id },
        },
        attachments: {
          create:
            attachments?.map((at: any) => ({
              url: at.url,
              type: at.type.toUpperCase(),
            })) || [],
        },
        ...(lessonId && {
          lesson: { connect: { id: lessonId } },
        }),
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("ERRO NO PRISMA:", error);
    return NextResponse.json(
      { error: "Erro ao criar post no banco" },
      { status: 500 },
    );
  }
}
