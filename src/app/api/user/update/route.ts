import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case "UPDATE_PROFILE":
        return NextResponse.json(
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              name: data.name?.trim(),
              username: data.username?.toLowerCase().trim(),
              bio: data.bio?.substring(0, 160),
            },
          }),
        );

      case "SET_LEVEL":
        const requirements: Record<string, number> = {
          A2: 20,
          B1: 50,
          B2: 100,
          C1: 200,
        };
        const userProgress = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { _count: { select: { completedLessons: true } } },
        });
        if (
          requirements[data.level] &&
          (userProgress?._count.completedLessons || 0) <
            requirements[data.level]
        ) {
          return NextResponse.json(
            { error: "Requisitos não atingidos" },
            { status: 403 },
          );
        }
        return NextResponse.json(
          await prisma.user.update({
            where: { id: session.user.id },
            data: { level: data.level },
          }),
        );

      case "ADD_FAMILY_MEMBER":
        const owner = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            children: true,
            payments: {
              where: { status: "APPROVED" },
              include: { plan: true },
              take: 1,
            },
          },
        });
        if (
          owner?.payments[0]?.plan?.type !== "FAMILY" ||
          owner.children.length >= 3
        ) {
          return NextResponse.json(
            { error: "Ação não permitida ou limite atingido" },
            { status: 403 },
          );
        }
        return NextResponse.json(
          await prisma.user.update({
            where: { email: data.email.toLowerCase().trim() },
            data: { parentId: session.user.id },
          }),
        );

      case "REMOVE_FAMILY_MEMBER":
        return NextResponse.json(
          await prisma.user.update({
            where: { id: data.memberId, parentId: session.user.id },
            data: { parentId: null },
          }),
        );

      case "UPDATE_NOTIFICATIONS":
        return NextResponse.json(
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              notifFlashcards:
                data.notifFlashcards !== undefined
                  ? !!data.notifFlashcards
                  : undefined,
              notifLessons:
                data.notifLessons !== undefined
                  ? !!data.notifLessons
                  : undefined,
              notifForum:
                data.notifForum !== undefined ? !!data.notifForum : undefined,
            },
          }),
        );

      case "DELETE_ACCOUNT":
        const userId = session.user.id;

        // 1. Tabelas de Autenticação e Sessão
        await prisma.account.deleteMany({ where: { userId } });
        await prisma.session.deleteMany({ where: { userId } });

        // 2. Conteúdo do Fórum (Cuidado: aqui os campos variam no seu schema)
        await prisma.commentLike.deleteMany({ where: { userId } });
        await prisma.commentReport.deleteMany({ where: { userId } });
        await prisma.forumComment.deleteMany({ where: { authorId: userId } });
        await prisma.forumPost.deleteMany({ where: { authorId: userId } });

        // 3. Estudo e Progresso
        await prisma.flashcard.deleteMany({ where: { userId } });
        await prisma.lessonProgress.deleteMany({ where: { userId } });
        await prisma.enrollment.deleteMany({ where: { userId } });

        // 4. Financeiro (No seu schema a relação é userId)
        await prisma.paymentMethod.deleteMany({ where: { userId } });
        await prisma.payment.deleteMany({ where: { userId } });

        // 5. Família (Se você for o "parent", remove o vínculo dos filhos)
        await prisma.user.updateMany({
          where: { parentId: userId },
          data: { parentId: null },
        });

        // 6. Finalmente o Usuário
        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ message: "Conta eliminada com sucesso" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PUT = POST;
