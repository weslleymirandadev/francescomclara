"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const userWithPayments = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    payments: {
      include: {
        subscriptionPlan: true,
      },
    },
  },
});

type UserWithRelations = Prisma.UserGetPayload<typeof userWithPayments>;

export interface UserTableData {
  id: string;
  name: string;
  email: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  plan: string;
  status: "Ativo" | "Inativo";
  date: string;
  reportCount: number;
  whatsappStatus?: string;
}

export async function getUsers(): Promise<UserTableData[]> {
  const users = await prisma.user.findMany({
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          subscriptionPlan: true,
        },
      },
      forumComments: {
        select: {
          _count: {
            select: { reports: true },
          },
        },
      },
      supportTickets: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user: any): UserTableData => {
    const lastPayment = user.payments?.[0];

    const reportCount = user.forumComments.reduce(
      (acc: number, comment: any) => acc + (comment._count?.reports || 0),
      0,
    );

    return {
      id: user.id,
      name: user.name || "Sem nome",
      email: user.email,
      role: user.role,
      plan: lastPayment?.subscriptionPlan?.name || "Sem plano",
      status: lastPayment?.status === "PAID" ? "Ativo" : "Inativo",
      date: new Date(user.createdAt).toLocaleDateString("pt-BR"),
      reportCount: reportCount,
      whatsappStatus: user.supportTickets?.[0]?.status || "NONE",
    };
  });
}

export async function getUserReports(userId: string) {
  const [commentReports, postReports] = await Promise.all([
    prisma.commentReport.findMany({
      where: { comment: { authorId: userId } },
      include: {
        user: { select: { name: true } },
        comment: { select: { content: true } },
      },
    }),
    prisma.postReport.findMany({
      where: { post: { authorId: userId } },
      include: {
        user: { select: { name: true } },
        post: { select: { title: true } },
      },
    }),
  ]);

  return { commentReports, postReports };
}

export async function banUser(userId: string, reason: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      status: "BANNED",
      banReason: reason,
      bannedAt: new Date(),
    },
  });
}

export async function closeTicket(userId: string) {
  return await prisma.supportTicket.updateMany({
    where: {
      userId: userId,
      status: "IN_PROGRESS",
    },
    data: {
      status: "CLOSED",
      updatedAt: new Date(),
    },
  });
}
