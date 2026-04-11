import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMercadoPagoToken } from "@/lib/mercadopago";

const mpApiUrl = process.env.MP_API_URL || "https://api.mercadopago.com";

/**
 * Cancela uma assinatura do Mercado Pago
 */
export async function POST(req: Request) {
  const token = await getMercadoPagoToken();
  try {
    const { subscriptionId, userId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "ID da assinatura é obrigatório" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const subscription = await prisma.payment.findUnique({
      where: { mpPaymentId: subscriptionId },
      include: { items: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 404 },
      );
    }

    if (subscription.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const response = await fetch(`${mpApiUrl}/preapproval/${subscriptionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "cancelled",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao cancelar assinatura no Mercado Pago:", errorData);

      return NextResponse.json(
        {
          error: "Erro ao cancelar assinatura no gateway",
          details:
            process.env.NODE_ENV === "development"
              ? JSON.stringify(errorData)
              : undefined,
        },
        { status: response.status || 500 },
      );
    }

    const cancelResponse = await response.json();

    await prisma.payment.update({
      where: { mpPaymentId: subscriptionId },
      data: { status: "CANCELLED" },
    });

    const planId = subscription.subscriptionPlanId;
    if (planId) {
      await prisma.enrollment.deleteMany({
        where: {
          userId,
          planId,
        },
      });
    }

    console.log(`Assinatura ${subscriptionId} cancelada com sucesso`);

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
      data: {
        subscriptionId: cancelResponse.id,
        status: cancelResponse.status,
      },
    });
  } catch (err) {
    console.error("Erro ao cancelar assinatura:", err);
    return NextResponse.json(
      {
        error: "Erro ao cancelar assinatura",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
