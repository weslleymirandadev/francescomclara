import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";

type PaymentStatus = 'PENDING' | 'APPROVED' | 'REFUNDED' | 'CANCELLED' | 'FAILED';
type PaymentItemType = 'COURSE' | 'JOURNEY' | 'MULTIPLE';

interface PaymentMetadata {
  userId?: string;
  items?: Array<{id: string; type: string; quantity?: number}>;
  [key: string]: any;
}

interface PaymentItem {
  id: string;
  type: string;
  quantity?: number;
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const paymentStatusMap: Record<string, PaymentStatus> = {
  'pending': 'PENDING',
  'approved': 'APPROVED',
  'refunded': 'REFUNDED',
  'cancelled': 'CANCELLED',
  'rejected': 'FAILED',
  'in_process': 'PENDING',
  'in_mediation': 'PENDING',
  'charged_back': 'FAILED'
};


async function sendOK(obj: any = { ok: true }) {
  return new NextResponse(JSON.stringify(obj), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getPaymentWithFallback(mpPaymentId: string) {
  try {
    const payment = await new MPPayment(client).get({ id: mpPaymentId });
    
    // Se não tiver userId no metadata, tenta buscar do banco de dados
    if (!payment.metadata?.userId) {
      console.log('Buscando userId do banco de dados para o pagamento:', mpPaymentId);
      const dbPayment = await prisma.payment.findUnique({
        where: { mpPaymentId: mpPaymentId.toString() },
        select: { userId: true, metadata: true }
      });
      
      if (dbPayment?.userId) {
        console.log('UserId encontrado no banco de dados:', dbPayment.userId);
        payment.metadata = {
          ...(payment.metadata || {}),
          ...(dbPayment.metadata as any || {}),
          userId: dbPayment.userId
        };
      }
    }
    
    return payment;
  } catch (err) {
    console.error("Erro ao buscar pagamento:", err);
    throw err;
  }
}

async function handlePaymentStatusUpdate(
  paymentId: string,
  status: PaymentStatus,
  userId: string,
  items: PaymentItem[]
) {
  await prisma.payment.updateMany({
    where: { mpPaymentId: paymentId },
    data: { status },
  });

  if (['CANCELLED', 'REFUNDED', 'FAILED'].includes(status)) {
    for (const item of items) {
      if (item.type === 'course') {
        await prisma.enrollment.deleteMany({
          where: { userId, courseId: item.id },
        });
      } else if (item.type === 'journey') {
        await prisma.enrollment.deleteMany({
          where: { userId, journeyId: item.id },
        });
      }
    }
  }
}

async function processApprovedPayment(
  paymentId: string,
  userId: string,
  amount: number | undefined,
  items: PaymentItem[],
  durationMonths: number = 12
) {
  if (!amount) amount = 0;

  const paymentData = {
    user: { connect: { id: userId } },
    mpPaymentId: paymentId,
    status: 'APPROVED' as const,
    amount: Math.round(amount * 100),
    itemType: (items.length === 1
      ? items[0].type === 'journey' ? 'JOURNEY' : 'COURSE'
      : 'MULTIPLE') as PaymentItemType,
    ...(items.length === 1 && items[0].type === 'course'
      ? { course: { connect: { id: items[0].id } } }
      : {}),
    ...(items.length === 1 && items[0].type === 'journey'
      ? { journey: { connect: { id: items[0].id } } }
      : {}),
  };

  await prisma.payment.upsert({
    where: { mpPaymentId: paymentId },
    create: paymentData,
    update: {
      status: 'APPROVED',
      amount: paymentData.amount,
    },
  });

  for (const item of items) {
    if (item.type === 'course') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId: item.id } },
        create: { userId, courseId: item.id, endDate: null },
        update: {},
      });
    } else if (item.type === 'journey') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      await prisma.enrollment.upsert({
        where: { userId_journeyId: { userId, journeyId: item.id } },
        create: { userId, journeyId: item.id, endDate },
        update: { endDate },
      });
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      console.error("Webhook sem body");
      return sendOK({ error: "invalid_body" });
    }

    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    const validTypes = ["payment", "refund", "chargeback", "merchant_order"];
    if (!validTypes.includes(body.type)) {
      console.log("Ignorando evento:", body.type);
      return sendOK({ ignored: true });
    }

    const mpPaymentId = body?.data?.id;
    if (!mpPaymentId) {
      console.error("Webhook sem paymentId");
      return sendOK({ error: "missing_payment_id" });
    }

    console.log('Processando webhook para pagamento ID:', mpPaymentId);
    
    let payment;
    try {
      payment = await getPaymentWithFallback(mpPaymentId);
    } catch (err) {
      console.error("Erro ao buscar pagamento:", err);
      return sendOK({ error: "payment_fetch_failed" });
    }

    console.log("Detalhes do pagamento:", {
      paymentId: payment.id,
      status: payment.status,
      hasMetadata: !!payment.metadata,
      metadataKeys: payment.metadata ? Object.keys(payment.metadata) : []
    });

    const status = String(payment.status || "").toLowerCase();
    const metadata: PaymentMetadata = payment.metadata || {};
    
    // Tenta obter o userId de várias fontes
    const userId = metadata.userId || 
                  (payment as any)?.external_reference || 
                  (payment as any)?.metadata?.user_id;

    console.log('Dados do usuário encontrados:', {
      fromMetadata: metadata.userId ? 'metadata' : 'not_found',
      fromExternalRef: (payment as any)?.external_reference ? 'external_reference' : 'not_found',
      fromNestedMetadata: (payment as any)?.metadata?.user_id ? 'nested_metadata' : 'not_found',
      userId
    });

    if (!userId) {
      console.error('Pagamento sem userId:', {
        mpPaymentId,
        metadata: payment.metadata,
        external_reference: (payment as any)?.external_reference,
        rawPayment: JSON.stringify(payment, null, 2)
      });
      return sendOK({ error: "missing_user_id", details: "Nenhum userId encontrado no pagamento" });
    }


    const items: PaymentItem[] =
      Array.isArray(metadata.items) && metadata.items.length > 0
        ? metadata.items
        : metadata.type && metadata.id
        ? [{ id: metadata.id, type: metadata.type, quantity: 1 }]
        : [];

    if (items.length === 0) {
      console.error("Pagamento sem items");
      return sendOK({ error: "missing_items" });
    }

    const mappedStatus = paymentStatusMap[status] || "PENDING";

    // REFUNDED / CANCELLED / FAILED
    if (["refunded", "cancelled", "rejected", "charged_back"].includes(status)) {
      console.log(`Processando status negativo: ${status}`);
      await handlePaymentStatusUpdate(
        mpPaymentId.toString(),
        mappedStatus,
        userId,
        items
      );
      return sendOK();
    }

    // APPROVED
    if (status === "approved") {
      await processApprovedPayment(
        mpPaymentId.toString(),
        userId,
        payment.transaction_amount,
        items,
        metadata.durationMonths ? parseInt(metadata.durationMonths) : 12
      );
      return sendOK();
    }

    // PENDING / IN_PROCESS / MEDIATION
    await prisma.payment.upsert({
      where: { mpPaymentId: mpPaymentId.toString() },
      create: {
        user: { connect: { id: userId } },
        mpPaymentId: mpPaymentId.toString(),
        status: mappedStatus,
        amount: payment.transaction_amount
          ? Math.round(payment.transaction_amount * 100)
          : 0,
        itemType:
          items.length === 1
            ? items[0].type === "journey"
              ? "JOURNEY"
              : "COURSE"
            : "MULTIPLE",
      },
      update: {
        status: mappedStatus,
      },
    });

    return sendOK();
  } catch (err) {
    console.error("Erro geral webhook:", err);
    return sendOK({ error: "internal" });
  }
}
