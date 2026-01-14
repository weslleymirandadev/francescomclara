import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const mpApiUrl = process.env.MP_API_URL || 'https://api.mercadopago.com';

/**
 * Cancela uma assinatura do Mercado Pago
 */
export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "ID da assinatura é obrigatório" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a assinatura pertence ao usuário
    const subscription = await prisma.payment.findUnique({
      where: { mpPaymentId: subscriptionId },
      include: { items: true }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 404 }
      );
    }

    if (subscription.userId !== userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Cancelar assinatura no Mercado Pago
    const response = await fetch(`${mpApiUrl}/preapproval/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        status: 'cancelled'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao cancelar assinatura no Mercado Pago:', errorData);
      
      return NextResponse.json(
        {
          error: "Erro ao cancelar assinatura no gateway",
          details: process.env.NODE_ENV === 'development' ? JSON.stringify(errorData) : undefined
        },
        { status: response.status || 500 }
      );
    }

    const cancelResponse = await response.json();

    // Atualizar status no banco
    await prisma.payment.update({
      where: { mpPaymentId: subscriptionId },
      data: { status: 'CANCELLED' }
    });

    // Remover acesso às trilhas
    await Promise.all(
      subscription.items.map((item: any) => {
        if (item.trackId) {
          return prisma.enrollment.deleteMany({
            where: {
              userId,
              trackId: item.trackId
            }
          });
        }
      })
    );

    console.log(`Assinatura ${subscriptionId} cancelada com sucesso`);

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
      data: {
        subscriptionId: cancelResponse.id,
        status: cancelResponse.status,
      }
    });

  } catch (err) {
    console.error('Erro ao cancelar assinatura:', err);
    return NextResponse.json(
      {
        error: "Erro ao cancelar assinatura",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}

