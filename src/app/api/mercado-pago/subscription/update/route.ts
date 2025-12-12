import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const mpApiUrl = process.env.MP_API_URL || 'https://api.mercadopago.com';

/**
 * Atualiza uma assinatura do Mercado Pago
 * Permite atualizar o valor, frequência ou outros parâmetros
 */
export async function POST(req: Request) {
  try {
    const {
      subscriptionId,
      userId,
      transaction_amount,
      frequency,
      frequency_type,
    } = await req.json();

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
      select: { userId: true, metadata: true }
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

    // Preparar dados de atualização
    const updateData: any = {};

    if (transaction_amount !== undefined) {
      updateData.auto_recurring = {
        ...(subscription.metadata as any)?.auto_recurring,
        transaction_amount: transaction_amount / 100, // Converter de centavos para reais
      };
    }

    if (frequency !== undefined || frequency_type !== undefined) {
      updateData.auto_recurring = {
        ...updateData.auto_recurring,
        ...(subscription.metadata as any)?.auto_recurring,
        ...(frequency !== undefined && { frequency }),
        ...(frequency_type !== undefined && { frequency_type }),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    // Atualizar assinatura no Mercado Pago
    const response = await fetch(`${mpApiUrl}/preapproval/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao atualizar assinatura no Mercado Pago:', errorData);
      
      return NextResponse.json(
        {
          error: "Erro ao atualizar assinatura no gateway",
          details: process.env.NODE_ENV === 'development' ? JSON.stringify(errorData) : undefined
        },
        { status: response.status || 500 }
      );
    }

    const updateResponse = await response.json();

    // Atualizar metadata no banco
    const updatedMetadata = {
      ...(subscription.metadata as any),
      ...(transaction_amount !== undefined && {
        transaction_amount: transaction_amount,
      }),
      ...(frequency !== undefined && { frequency }),
      ...(frequency_type !== undefined && { frequencyType: frequency_type }),
      auto_recurring: updateResponse.auto_recurring,
    };

    await prisma.payment.update({
      where: { mpPaymentId: subscriptionId },
      data: {
        metadata: updatedMetadata,
        ...(transaction_amount !== undefined && {
          amount: transaction_amount
        }),
      }
    });

    console.log(`Assinatura ${subscriptionId} atualizada com sucesso`);

    return NextResponse.json({
      success: true,
      message: "Assinatura atualizada com sucesso",
      data: {
        subscriptionId: updateResponse.id,
        status: updateResponse.status,
        auto_recurring: updateResponse.auto_recurring,
      }
    });

  } catch (err) {
    console.error('Erro ao atualizar assinatura:', err);
    return NextResponse.json(
      {
        error: "Erro ao atualizar assinatura",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}

