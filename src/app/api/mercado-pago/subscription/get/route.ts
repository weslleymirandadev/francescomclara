import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMercadoPagoToken } from "@/lib/mercadopago";

const mpApiUrl = process.env.MP_API_URL || 'https://api.mercadopago.com';

/**
 * Busca informações de uma assinatura
 */
export async function GET(req: Request) {
  const token = await getMercadoPagoToken();

  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const userId = searchParams.get('userId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "ID da assinatura é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar assinatura no banco
    const subscription = await prisma.payment.findUnique({
      where: { mpPaymentId: subscriptionId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 404 }
      );
    }

    // Verificar autorização se userId fornecido
    if (userId && subscription.userId !== userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Buscar informações atualizadas do Mercado Pago (Preapproval API)
    let mpSubscription = null;
    try {
      const response = await fetch(`${mpApiUrl}/preapproval/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        mpSubscription = await response.json();
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura no Mercado Pago:', error);
      // Continuar mesmo se falhar, retornar dados do banco
    }

    // Adicionar informações de reembolso se disponível
    const metadata = subscription.metadata as any;
    const refundWindowDays = metadata.refundWindowDays || (metadata.period === 'YEARLY' ? 30 : 7);
    const daysSinceCreation = Math.floor((Date.now() - subscription.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const canRefund = daysSinceCreation <= refundWindowDays && subscription.status !== 'CANCELLED';

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        mpPaymentId: subscription.mpPaymentId,
        userId: subscription.userId,
        status: subscription.status,
        amount: subscription.amount,
        metadata: subscription.metadata,
        items: subscription.items,
        user: subscription.user,
        mpSubscription: mpSubscription,
        refundInfo: {
          canRefund,
          refundWindowDays,
          daysSinceCreation,
          daysRemaining: Math.max(0, refundWindowDays - daysSinceCreation),
        },
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      }
    });

  } catch (err) {
    console.error('Erro ao buscar assinatura:', err);
    return NextResponse.json(
      {
        error: "Erro ao buscar assinatura",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}

