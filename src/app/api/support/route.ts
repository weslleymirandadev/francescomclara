import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserFeatures } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const userFeatures = await getUserFeatures(userId);

    if (!userFeatures.hasPrioritySupport) {
      return NextResponse.json(
        {
          message:
            "O suporte para o seu plano é realizado exclusivamente via e-mail. Por favor, envie sua dúvida para contato@francescomclara.com.",
          isEmailOnly: true,
        },
        { status: 200 },
      );
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Assunto e mensagem são obrigatórios" },
        { status: 400 },
      );
    }

    let ticket = await prisma.supportTicket.findFirst({
      where: {
        userId: userId,
        status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"] },
      },
    });

    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId,
          subject,
          message,
          priority: "HIGH",
          status: "OPEN",
          isPriority: true,
        },
      });
      console.log("🆕 Novo ticket criado.");
    } else {
      console.log("♻️ Aluno já possui ticket ativo. Nenhuma duplicata criada.");
    }

    return NextResponse.json(
      {
        ticket: {
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt,
        },
        message:
          "Seu atendimento prioritário está ativo. A equipe entrará em contato em até 24h.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao processar suporte:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const userFeatures = await getUserFeatures(userId);

    if (userFeatures.hasPrioritySupport) {
      const phone = process.env.CLARA_WHATSAPP;
      const studentEmail = session.user.email;
      const studentName = session.user.name || "Aluno";

      const validationToken = Buffer.from(
        `${studentEmail}-${new Date().getDay()}`,
      )
        .toString("base64")
        .slice(0, 6)
        .toUpperCase();

      await prisma.supportTicket.create({
        data: {
          userId,
          subject: "Atendimento via WhatsApp",
          message: "Iniciado via Canal VIP",
          priority: "HIGH",
          status: "OPEN",
          isPriority: true,
        },
      });

      const message =
        `[ CANAL VIP - ATENDIMENTO VERIFICADO ]\n\n` +
        `*Aluno:* ${studentName}\n` +
        `*E-mail:* ${studentEmail}\n` +
        `*Token:* ${validationToken}\n\n` +
        `---------------------------------------\n` +
        `Olá Clara, preciso de ajuda com o seguinte:`;

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      return NextResponse.json({ whatsappUrl });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        subject: true,
        priority: true,
        status: true,
        isPriority: true,
        createdAt: true,
        updatedAt: true,
        responses: {
          select: {
            id: true,
            message: true,
            isAdmin: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Erro ao buscar tickets de suporte:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tickets" },
      { status: 500 },
    );
  }
}
