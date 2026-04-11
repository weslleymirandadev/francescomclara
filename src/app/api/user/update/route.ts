import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

      case "SET_LEVEL": {
        const requirements: Record<string, number> = {
          A2: 20,
          B1: 50,
          B2: 100,
          C1: 200,
        };

        const userProgress = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            _count: {
              select: { lessonProgresses: true },
            },
          },
        });

        if (!userProgress) {
          return NextResponse.json(
            { error: "Usuário não encontrado" },
            { status: 404 },
          );
        }

        const completedCount = userProgress._count.lessonProgresses;
        const targetLevel = data.level as string;

        if (
          requirements[targetLevel] &&
          completedCount < requirements[targetLevel]
        ) {
          return NextResponse.json(
            {
              error: `Você precisa de ${requirements[targetLevel]} lições para o nível ${targetLevel}. (Atual: ${completedCount})`,
            },
            { status: 403 },
          );
        }

        return NextResponse.json(
          await prisma.user.update({
            where: { id: session.user.id },
            data: { level: targetLevel as any },
          }),
        );
      }

      case "ADD_FAMILY_MEMBER": {
        const owner = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            children: true,
            payments: {
              where: { status: "APPROVED" },
              include: {
                subscriptionPlan: true,
              },
              take: 1,
            },
          },
        });

        if (!owner)
          return NextResponse.json(
            { error: "Dono não encontrado" },
            { status: 404 },
          );

        const lastPayment = owner.payments?.[0];
        const planType = lastPayment?.subscriptionPlan?.type;
        const childrenCount = owner.children?.length || 0;

        if (planType !== "FAMILY" || childrenCount >= 3) {
          return NextResponse.json(
            { error: "Ação não permitida ou limite atingido" },
            { status: 403 },
          );
        }

        try {
          const updatedMember = await prisma.user.update({
            where: { email: data.email.toLowerCase().trim() },
            data: { parentId: session.user.id },
          });
          return NextResponse.json(updatedMember);
        } catch (error) {
          return NextResponse.json(
            { error: "Membro não encontrado" },
            { status: 404 },
          );
        }
      }

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

      case "DELETE_ACCOUNT": {
        const userId = session.user.id;

        const userWithMedia = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            forumPosts: {
              include: { attachments: true },
            },
          },
        });

        if (!userWithMedia)
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );

        try {
          const userFiles = [userWithMedia.image, userWithMedia.banner].filter(
            Boolean,
          ) as string[];
          if (userFiles.length > 0) {
            const userPaths = userFiles
              .map((url) => url.split("/").pop())
              .filter(Boolean) as string[];
            await supabase.storage.from("user-uploads").remove(userPaths);
          }

          const postFiles: string[] = [];
          userWithMedia.forumPosts.forEach((post) => {
            post.attachments.forEach((att) => postFiles.push(att.url));
          });

          if (postFiles.length > 0) {
            const postPaths = postFiles
              .map((url) => {
                const fileName = url.split("/").pop();
                return fileName ? `posts/${fileName}` : null;
              })
              .filter(Boolean) as string[];
            await supabase.storage.from("forum-attachments").remove(postPaths);
          }
        } catch (storageError) {
          console.error("Erro ao limpar Storage:", storageError);
        }

        await prisma.account.deleteMany({ where: { userId } });
        await prisma.session.deleteMany({ where: { userId } });

        await prisma.forumAttachment.deleteMany({
          where: { post: { authorId: userId } },
        });

        await prisma.postLike.deleteMany({ where: { userId } });
        await prisma.commentLike.deleteMany({ where: { userId } });
        await prisma.commentReport.deleteMany({ where: { userId } });
        await prisma.forumComment.deleteMany({ where: { authorId: userId } });
        await prisma.forumPost.deleteMany({ where: { authorId: userId } });
        await prisma.flashcard.deleteMany({ where: { userId } });
        await prisma.lessonProgress.deleteMany({ where: { userId } });

        await prisma.enrollment.deleteMany({ where: { userId } });
        await prisma.payment.deleteMany({ where: { userId } });

        await prisma.user.updateMany({
          where: { parentId: userId },
          data: { parentId: null },
        });

        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ message: "Conta e arquivos deletados!" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PUT = POST;
