import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, data, currentPassword, newPassword } = body;

    switch (action) {
      case "CHANGE_PASSWORD":
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        console.log("Usuário encontrado no banco:", user ? "Sim" : "Não");

        if (!user || !user.password) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
          where: { id: session.user.id },
          data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Senha alterada com sucesso!" });
        
      case "UPDATE_PROFILE":
        return NextResponse.json(await prisma.user.update({
          where: { id: session.user.id },
          data: { 
            name: data.name?.trim(),
            username: data.username?.toLowerCase().trim(),
            bio: data.bio?.substring(0, 160)
          }
        }));

      case "SET_LEVEL":
        const requirements: Record<string, number> = { "A2": 20, "B1": 50, "B2": 100, "C1": 200 };
        const userProgress = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { _count: { select: { completedLessons: true } } }
        });
        if (requirements[data.level] && (userProgress?._count.completedLessons || 0) < requirements[data.level]) {
          return NextResponse.json({ error: "Requisitos não atingidos" }, { status: 403 });
        }
        return NextResponse.json(await prisma.user.update({
          where: { id: session.user.id },
          data: { level: data.level }
        }));

      case "ADD_FAMILY_MEMBER":
        const owner = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { children: true, payments: { where: { status: "APPROVED" }, include: { plan: true }, take: 1 } }
        });
        if (owner?.payments[0]?.plan?.type !== "FAMILY" || owner.children.length >= 3) {
          return NextResponse.json({ error: "Ação não permitida ou limite atingido" }, { status: 403 });
        }
        return NextResponse.json(await prisma.user.update({
          where: { email: data.email.toLowerCase().trim() },
          data: { parentId: session.user.id }
        }));

      case "REMOVE_FAMILY_MEMBER":
        return NextResponse.json(await prisma.user.update({
          where: { id: data.memberId, parentId: session.user.id },
          data: { parentId: null }
        }));

      case "UPDATE_NOTIFICATIONS":
        return NextResponse.json(await prisma.user.update({
          where: { id: session.user.id },
          data: { 
            notifFlashcards: data.notifFlashcards !== undefined ? !!data.notifFlashcards : undefined,
            notifLessons: data.notifLessons !== undefined ? !!data.notifLessons : undefined,
            notifForum: data.notifForum !== undefined ? !!data.notifForum : undefined,
          }
        }));

      case "DELETE_ACCOUNT":
        await prisma.account.deleteMany({ where: { userId: session.user.id } });
        await prisma.session.deleteMany({ where: { userId: session.user.id } });
        await prisma.lessonProgress.deleteMany({ where: { userId: session.user.id } });
        
        await prisma.user.delete({ where: { id: session.user.id } });
        
        return NextResponse.json({ message: "Conta eliminada com sucesso" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PUT = POST;