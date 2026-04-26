import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFeatures } from "@/lib/subscription";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const features = await getUserFeatures(userId);

  if (!features.hasPrioritySupport) {
    return NextResponse.json(
      { error: "Acesso VIP necessário" },
      { status: 403 },
    );
  }

  const activeTicket = await prisma.supportTicket.findFirst({
    where: {
      userId: userId,
      status: {
        in: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"],
      },
    },
  });

  if (!activeTicket) {
    await prisma.supportTicket.create({
      data: {
        userId,
        subject: "Atendimento via WhatsApp",
        message: "Link de redirecionamento gerado pelo sistema.",
        priority: "HIGH",
        status: "OPEN",
        isPriority: true,
      },
    });
    console.log(`🆕 Ticket de controle criado para VIP: ${session.user.email}`);
  } else {
    console.log(
      `♻️ Usuário ${session.user.email} já possui atendimento ativo.`,
    );
  }

  const phone = process.env.CLARA_WHATSAPP;
  const studentEmail = session.user.email;
  const studentName = session.user.name || "Aluno";

  const validationToken = Buffer.from(`${studentEmail}-${new Date().getDay()}`)
    .toString("base64")
    .slice(0, 6)
    .toUpperCase();

  const message =
    `[ CANAL VIP - ATENDIMENTO VERIFICADO ]\n\n` +
    `*Aluno:* ${studentName}\n` +
    `*E-mail:* ${studentEmail}\n` +
    `*Token:* ${validationToken}\n\n` +
    `---------------------------------------\n` +
    `Olá Clara, preciso de ajuda com o seguinte:`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ url: whatsappUrl });
}
