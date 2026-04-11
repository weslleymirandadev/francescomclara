import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        enrollments: {
          where: {
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          },
          include: { plan: true },
          take: 1,
        },
        _count: {
          select: {
            reports: true,
            commentReports: true,
            forumPosts: {
              where: { reports: { some: {} } },
            },
          },
        },
      },
    });

    const reportsCreated =
      (user?._count?.reports || 0) + (user?._count?.commentReports || 0);
    const reportsReceived = user?._count?.forumPosts || 0;

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      subscription: user.enrollments[0]?.plan || null,
      reportsCreated,
      reportsReceived,
    });
  } catch (error) {
    console.error("ADMIN_USER_GET_ERR:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
