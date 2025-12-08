import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

/**
 * WEBHOOK – Mercado Pago
 * Recebe notificações de pagamento, atualização de status e reembolso.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validTypes = ["payment", "refund", "chargeback", "merchant_order"];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ ok: true });
    }

    const mpPaymentId = body?.data?.id;
    if (!mpPaymentId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Busca status completo SEMPRE
    const payment = await new MPPayment(client).get({ id: mpPaymentId });
    const status = payment.status;                // approved, refunded, cancelled...
    const metadata = payment.metadata || {};
    const userId = metadata.userId;
    const items = metadata.items || [];           // Array de itens do pagamento
    
    // Suporte para formato antigo (um único item)
    const itemType = metadata.type;
    const itemId = metadata.id;
    const durationMonths = metadata.durationMonths ?? 12;

    if (!userId) {
      return NextResponse.json({ ok: true });
    }

    // Se não houver items no formato novo, usar formato antigo
    const itemsToProcess = items.length > 0 
      ? items 
      : (itemType && itemId ? [{ id: itemId, type: itemType, quantity: 1 }] : []);

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ ok: true });
    }

    // =====================================================================
    // 1. SE STATUS = REFUNDED — CRIAR UMA LÓGICA DE REVERSÃO DE ACESSO
    // =====================================================================
    if (status === "refunded" || status === "cancelled") {
      await prisma.payment.updateMany({
        where: { mpPaymentId: mpPaymentId.toString() },
        data: { status: status.toUpperCase() },
      });

      // Remove acesso do usuário para todos os itens
      for (const item of itemsToProcess) {
        if (item.type === "course") {
          await prisma.enrollment.deleteMany({
            where: { userId, courseId: item.id },
          });
        }

        if (item.type === "journey") {
          await prisma.enrollment.deleteMany({
            where: { userId, journeyId: item.id },
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    // =====================================================================
    // 2. PROCESSA SOMENTE PAGAMENTOS APROVADOS
    // =====================================================================
    if (status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // =====================================================================
    // 3. Buscar ou criar registro de pagamento
    // =====================================================================
    const existingPayment = await prisma.payment.findUnique({
      where: { mpPaymentId: mpPaymentId.toString() },
    });

    if (!existingPayment) {
      // Se não existir, criar (caso o webhook seja chamado antes do retorno da API)
      await prisma.payment.create({
        data: {
          userId,
          mpPaymentId: mpPaymentId.toString(),
          status: "APPROVED",
          amount: Math.round(payment.transaction_amount! * 100), // Converter para centavos
          itemType: itemsToProcess.length === 1 
            ? (itemsToProcess[0].type === "journey" ? "JOURNEY" : "COURSE")
            : "MULTIPLE",
          courseId: itemsToProcess.length === 1 && itemsToProcess[0].type === "course" 
            ? itemsToProcess[0].id 
            : null,
          journeyId: itemsToProcess.length === 1 && itemsToProcess[0].type === "journey" 
            ? itemsToProcess[0].id 
            : null,
        },
      });
    } else if (existingPayment.status !== "APPROVED") {
      // Atualizar status se ainda não estiver aprovado
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "APPROVED" },
      });
    }
    // Se já está aprovado, continuar para processar enrollments (idempotente)

    // Processar enrollments para todos os itens
    for (const item of itemsToProcess) {
      if (item.type === "course") {
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: { userId, courseId: item.id },
          },
          create: {
            userId,
            courseId: item.id,
            endDate: null,  // Vitalício
          },
          update: {},
        });
      }

      if (item.type === "journey") {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        await prisma.enrollment.upsert({
          where: {
            userId_journeyId: { userId, journeyId: item.id },
          },
          create: {
            userId,
            journeyId: item.id,
            endDate,
          },
          update: {},
        });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
