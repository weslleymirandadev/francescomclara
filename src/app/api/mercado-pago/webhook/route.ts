import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";

type PaymentStatus = 'PENDING' | 'APPROVED' | 'REFUNDED' | 'CANCELLED' | 'FAILED';

interface PaymentItem {
  id: string;
  type: 'track';
  quantity: number;
  price: number;
  title: string;
  description: string;
  trackId: string;
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


async function ensureUserExists(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      const error = new Error(`Usuário com ID ${userId} não encontrado`);
      console.error(error.message);
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    throw error;
  }
}

async function sendOK(obj: any = { ok: true }) {
  return new NextResponse(JSON.stringify(obj), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Busca informações de um pagamento recorrente do Mercado Pago
 */
async function getPayment(mpPaymentId: string) {
  try {
    const payment = await new MPPayment(client).get({ id: mpPaymentId });
    return payment;
  } catch (err) {
    console.error("Erro ao buscar pagamento:", err);
    throw err;
  }
}

async function revokeUserAccess(userId: string, items: PaymentItem[]) {
  for (const item of items) {
    try {
      await prisma.enrollment.deleteMany({
        where: { userId, trackId: item.id }
      });
      console.log(`Acesso removido da trilha ${item.id} para o usuário ${userId}`);
    } catch (error) {
      console.error(`Erro ao remover acesso para a trilha ${item.id}:`, error);
    }
  }
}


/**
 * Busca informações de uma assinatura (Preapproval) do Mercado Pago
 */
async function getPreapproval(preapprovalId: string) {
  try {
    const mpApiUrl = process.env.MP_API_URL || 'https://api.mercadopago.com';
    const response = await fetch(`${mpApiUrl}/preapproval/${preapprovalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar assinatura: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar assinatura:", err);
    throw err;
  }
}

/**
 * Processa uma assinatura autorizada
 */
async function processAuthorizedSubscription(
  preapprovalId: string,
  userId: string,
  items: PaymentItem[],
  metadata: any
) {
  try {
    await ensureUserExists(userId);

    const frequency = metadata.frequency || 1;
    const frequencyType = metadata.frequencyType || 'months';
    
    // Calcular data de término baseada na frequência (padrão: 12 meses)
    const endDate = new Date();
    if (frequencyType === 'months') {
      endDate.setMonth(endDate.getMonth() + (12 * frequency));
    } else {
      endDate.setDate(endDate.getDate() + (365 * frequency));
    }

    // Criar ou atualizar pagamento/assinatura
    await prisma.payment.upsert({
      where: { mpPaymentId: preapprovalId },
      create: {
        mpPaymentId: preapprovalId,
        userId,
        status: 'APPROVED',
        amount: items.reduce((sum, item) => sum + (item.price || 0), 0),
        metadata: {
          type: 'subscription',
          ...metadata,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
        },
        items: {
          create: items.map(item => ({
            trackId: item.id,
            price: item.price || 0,
            quantity: item.quantity || 1,
            title: item.title || 'Trilha',
            description: item.description || 'Acesso à trilha',
          })),
        },
      },
      update: {
        status: 'APPROVED',
        metadata: {
          type: 'subscription',
          ...metadata,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
        },
      },
    });

    // Criar ou atualizar matrículas com data de término baseada na assinatura
    await Promise.all(
      items.map(item =>
        prisma.enrollment.upsert({
          where: {
            userId_trackId: { userId, trackId: item.id }
          },
          create: {
            userId,
            trackId: item.id,
            startDate: new Date(),
            endDate: endDate,
          },
          update: {
            // Estender data de término se necessário
            endDate: endDate,
          }
        })
      )
    );

    console.log(`Assinatura ${preapprovalId} autorizada e acesso concedido ao usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao processar assinatura autorizada:', error);
    throw error;
  }
}

/**
 * Processa um pagamento recorrente de uma assinatura
 */
async function processRecurringPayment(
  paymentId: string,
  preapprovalId: string,
  userId: string
) {
  try {
    // Buscar a assinatura no banco
    const subscription = await prisma.payment.findUnique({
      where: { mpPaymentId: preapprovalId },
      include: { items: true }
    });

    if (!subscription) {
      console.error(`Assinatura ${preapprovalId} não encontrada no banco`);
      return;
    }

    const metadata = subscription.metadata as any;
    const frequency = metadata.frequency || 1;
    const frequencyType = metadata.frequencyType || 'months';

    // Estender data de término das matrículas
    const endDate = new Date();
    if (frequencyType === 'months') {
      endDate.setMonth(endDate.getMonth() + (12 * frequency));
    } else {
      endDate.setDate(endDate.getDate() + (365 * frequency));
    }

    // Atualizar matrículas para estender o acesso
    await Promise.all(
      subscription.items.map(item =>
        prisma.enrollment.updateMany({
          where: {
            userId,
            trackId: item.trackId || ''
          },
          data: {
            endDate: endDate,
          }
        })
      )
    );

    console.log(`Pagamento recorrente ${paymentId} processado para assinatura ${preapprovalId}`);
  } catch (error) {
    console.error('Erro ao processar pagamento recorrente:', error);
    throw error;
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

    const eventType = body.type;
    const mpId = body?.data?.id;

    if (!mpId) {
      console.error("Webhook sem ID");
      return sendOK({ error: "missing_id" });
    }

    // Processar eventos de assinatura (Preapproval)
    if (eventType === "preapproval") {
      console.log('Processando evento de assinatura:', mpId);

      let preapproval;
      try {
        preapproval = await getPreapproval(mpId.toString());
      } catch (err) {
        console.error("Erro ao buscar assinatura:", err);
        return sendOK({ error: "preapproval_fetch_failed" });
      }

      // Buscar assinatura no banco
      const dbSubscription = await prisma.payment.findUnique({
        where: { mpPaymentId: mpId.toString() },
        select: { userId: true, metadata: true }
      });

      if (!dbSubscription) {
        console.error(`Assinatura ${mpId} não encontrada no banco`);
        return sendOK({ error: "subscription_not_found" });
      }

      const metadata = dbSubscription.metadata as any;
      const userId = dbSubscription.userId;
      const status = preapproval.status?.toLowerCase();

      // Extrair items do metadata
      const rawItems = metadata.items || [];
      const items: PaymentItem[] = rawItems.map((item: any) => ({
        id: item.id,
        type: 'track',
        trackId: item.id,
        title: item.title || 'Trilha',
        description: item.description || 'Acesso à trilha',
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      if (items.length === 0) {
        console.error("Assinatura sem items");
        return sendOK({ error: "missing_items" });
      }

      // Processar diferentes status de assinatura
      if (status === "authorized") {
        await processAuthorizedSubscription(mpId.toString(), userId, items, metadata);
        return sendOK();
      } else if (status === "cancelled" || status === "paused") {
        // Cancelar assinatura e remover acesso
        await prisma.payment.update({
          where: { mpPaymentId: mpId.toString() },
          data: { status: 'CANCELLED' }
        });
        await revokeUserAccess(userId, items);
        return sendOK();
      } else {
        // Atualizar status da assinatura
        await prisma.payment.update({
          where: { mpPaymentId: mpId.toString() },
          data: { status: status?.toUpperCase() || 'PENDING' }
        });
        return sendOK();
      }
    }

    // Processar eventos de pagamento recorrente (apenas para assinaturas)
    if (eventType === "payment") {
      console.log('Processando evento de pagamento recorrente:', mpId);

      let payment;
      try {
        payment = await getPayment(mpId.toString());
      } catch (err) {
        console.error("Erro ao buscar pagamento:", err);
        return sendOK({ error: "payment_fetch_failed" });
      }

      // Verificar se é um pagamento de assinatura
      const preapprovalId = (payment as any).preapproval_id;
      if (!preapprovalId) {
        // Não é um pagamento de assinatura, ignorar
        console.log('Pagamento não é de assinatura, ignorando');
        return sendOK({ ignored: "not_subscription_payment" });
      }

      // Buscar assinatura relacionada
      const subscription = await prisma.payment.findUnique({
        where: { mpPaymentId: preapprovalId.toString() },
        select: { userId: true, metadata: true, items: true }
      });

      if (!subscription) {
        console.error(`Assinatura ${preapprovalId} não encontrada para pagamento ${mpId}`);
        return sendOK({ error: "subscription_not_found" });
      }

      const userId = subscription.userId;
      const metadata = subscription.metadata as any;
      const rawItems = metadata.items || [];
      const items: PaymentItem[] = rawItems.map((item: any) => ({
        id: item.id,
        type: 'track',
        trackId: item.id,
        title: item.title || 'Trilha',
        description: item.description || 'Acesso à trilha',
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      const status = String(payment.status || "").toLowerCase();

      // Se o pagamento foi aprovado, estender acesso
      if (status === "approved") {
        await processRecurringPayment(mpId.toString(), preapprovalId.toString(), userId);
      } else if (["refunded", "cancelled", "rejected"].includes(status)) {
        // Se o pagamento falhou, pode ser necessário pausar a assinatura
        console.log(`Pagamento recorrente ${mpId} falhou com status: ${status}`);
        // Nota: Não removemos acesso imediatamente, apenas registramos
      }

      return sendOK();
    }

    // Outros tipos de eventos (refund, chargeback, etc.)
    const validTypes = ["refund", "chargeback", "merchant_order"];
    if (validTypes.includes(eventType)) {
      console.log(`Processando evento ${eventType}:`, mpId);
      // Processar conforme necessário
      return sendOK();
    }

    console.log("Tipo de evento não suportado:", eventType);
    return sendOK({ ignored: true, type: eventType });
  } catch (err) {
    console.error("Erro geral webhook:", err);
    return sendOK({ error: "internal" });
  }
}
