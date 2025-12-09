import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";

type PaymentStatus = 'PENDING' | 'APPROVED' | 'REFUNDED' | 'CANCELLED' | 'FAILED';
type PaymentItemType = 'COURSE' | 'JOURNEY' | 'MULTIPLE';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// Map MercadoPago status to our internal status
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

interface PaymentItem {
  id: string;
  type: string;
  quantity?: number;
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
    // Remove access for failed/refunded payments
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
  if (!amount) {
    throw new Error('Amount is required for approved payment');
  }

  const paymentData = {
    user: { connect: { id: userId } },
    mpPaymentId: paymentId,
    status: 'APPROVED' as const,
    amount: Math.round(amount * 100), // Convert to cents
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

  // Process enrollments
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

/**
 * WEBHOOK – Mercado Pago
 * Recebe notificações de pagamento, atualização de status e reembolso.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    const validTypes = ["payment", "refund", "chargeback", "merchant_order"];

    if (!validTypes.includes(body.type)) {
      console.log('Ignoring webhook with invalid type:', body.type);
      return NextResponse.json({ ok: true });
    }

    const mpPaymentId = body?.data?.id;
    if (!mpPaymentId) {
      console.error('No payment ID in webhook payload');
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
      // Busca status completo SEMPRE
      const payment = await new MPPayment(client).get({ id: mpPaymentId });
      console.log('Payment details:', JSON.stringify(payment, null, 2));
      
      const status = payment.status?.toLowerCase() || '';
      const metadata = payment.metadata || {};
      const userId = metadata.userId;
      const items = Array.isArray(metadata.items) ? metadata.items : [];
      
      // Suporte para formato antigo (um único item)
      const itemType = metadata.type;
      const itemId = metadata.id;
      const durationMonths = metadata.durationMonths ? parseInt(metadata.durationMonths) : 12;

      if (!userId) {
        console.error('No userId in payment metadata');
        return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
      }

      // Se não houver items no formato novo, usar formato antigo
      const itemsToProcess: PaymentItem[] = items.length > 0 
        ? items 
        : (itemType && itemId ? [{ id: itemId, type: itemType, quantity: 1 }] : []);

      if (itemsToProcess.length === 0) {
        console.error('No items to process in payment');
        return NextResponse.json({ error: "No items to process" }, { status: 400 });
      }

      // Get the mapped status or default to PENDING
      const mappedStatus = paymentStatusMap[status] || 'PENDING';
      console.log(`Processing payment ${mpPaymentId} with status: ${status} (mapped to: ${mappedStatus})`);

      // Handle different payment statuses
      if (['refunded', 'cancelled', 'rejected', 'charged_back'].includes(status)) {
        console.log(`Processing ${status} payment`);
        await handlePaymentStatusUpdate(
          mpPaymentId.toString(),
          mappedStatus,
          userId,
          itemsToProcess
        );
        return NextResponse.json({ ok: true });
      }

      // Process approved payments
      if (status === 'approved') {
        console.log('Processing approved payment');
        await processApprovedPayment(
          mpPaymentId.toString(),
          userId,
          payment.transaction_amount,
          itemsToProcess,
          durationMonths
        );
        return NextResponse.json({ ok: true });
      }

      // For pending or other statuses, just update the status
      if (['pending', 'in_process', 'in_mediation'].includes(status)) {
        console.log(`Updating payment status to ${mappedStatus}`);
        await prisma.payment.upsert({
          where: { mpPaymentId: mpPaymentId.toString() },
          create: {
            user: { connect: { id: userId } },
            mpPaymentId: mpPaymentId.toString(),
            status: mappedStatus,
            amount: payment.transaction_amount ? Math.round(payment.transaction_amount * 100) : 0,
            itemType: itemsToProcess.length === 1
              ? (itemsToProcess[0].type === 'journey' ? 'JOURNEY' : 'COURSE')
              : 'MULTIPLE',
          },
          update: {
            status: mappedStatus,
          },
        });
      }

      return NextResponse.json({ ok: true });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      // If it's a duplicate key error, just log and continue
      if (error.code === 'P2002') {
        console.log(`Payment with mpPaymentId ${mpPaymentId} already exists, continuing...`);
        return NextResponse.json({ ok: true });
      }
      
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Error in webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
