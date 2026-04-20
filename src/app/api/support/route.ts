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

    const body = await request.json();
    const { subject, message, priority } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Assunto e mensagem são obrigatórios" }, { status: 400 });
    }

    const userId = session.user.id;
    const userFeatures = await getUserFeatures(userId);

    // Verificar se usuário tem suporte prioritário
    const ticketPriority = userFeatures.hasPrioritySupport ? "HIGH" : (priority || "NORMAL");

    // Criar ticket de suporte
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        priority: ticketPriority,
        status: "OPEN",
        isPriority: userFeatures.hasPrioritySupport,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // TODO: Enviar notificação por email para a equipe de suporte
    // TODO: Enviar confirmação por email para o usuário

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        isPriority: ticket.isPriority,
        createdAt: ticket.createdAt,
      },
      message: userFeatures.hasPrioritySupport 
        ? "Seu ticket de suporte prioritário foi criado e será respondido em até 24h."
        : "Seu ticket de suporte foi criado e será respondido em até 72h."
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar ticket de suporte:", error);
    return NextResponse.json({ error: "Erro ao criar ticket de suporte" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json(tickets);

  } catch (error) {
    console.error("Erro ao buscar tickets de suporte:", error);
    return NextResponse.json({ error: "Erro ao buscar tickets" }, { status: 500 });
  }
}
