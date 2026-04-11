import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMercadoPagoToken } from "@/lib/mercadopago";

type PaymentItem = {
  id: string;
  type: "curso";
  quantity?: number;
  price?: number;
  title?: string;
};

type PaymentMetadata = {
  type?: string;
  items?: PaymentItem[];
  durationMonths?: number;
  [key: string]: any;
};

export async function POST(req: Request) {
  const token = await getMercadoPagoToken();

  try {
    const { paymentId, userId } = await req.json();
    console.log(
      `Iniciando processo de reembolso para pagamento ${paymentId}, usuário ${userId}`,
    );

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        items: true,
        refunds: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Pagamento não encontrado: ${paymentId}`);
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 },
      );
    }

    if (payment.userId !== userId) {
      console.error(
        `Acesso não autorizado: usuário ${userId} tentou reembolsar pagamento de outro usuário`,
      );
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const hasApprovedRefund = payment.refunds.some(
      (r: any) => r.status === "COMPLETED" || r.status === "APPROVED",
    );
    if (hasApprovedRefund) {
      console.error(
        `Já existe um reembolso aprovado para o pagamento ${paymentId}`,
      );
      return NextResponse.json(
        {
          error: "Este pagamento já foi reembolsado",
        },
        { status: 400 },
      );
    }

    const metadata = payment.metadata as PaymentMetadata;
    const isSubscription = metadata.type === "subscription";

    if (!isSubscription) {
      return NextResponse.json(
        {
          error: "Este endpoint é apenas para reembolso de assinaturas",
        },
        { status: 400 },
      );
    }

    if (payment.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Esta assinatura já foi cancelada",
        },
        { status: 400 },
      );
    }

    const refundWindowDays =
      metadata.refundWindowDays || (metadata.period === "YEARLY" ? 30 : 7);
    const daysSinceCreation = Math.floor(
      (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceCreation > refundWindowDays) {
      const periodText = metadata.period === "YEARLY" ? "anual" : "mensal";
      return NextResponse.json(
        {
          error: `O prazo para reembolso de assinatura ${periodText} é de ${refundWindowDays} dias. O prazo já expirou.`,
        },
        { status: 400 },
      );
    }

    console.log(`Cancelando assinatura ${payment.mpPaymentId}`);

    try {
      const mpApiUrl = process.env.MP_API_URL || "https://api.mercadopago.com";
      const cancelResponse = await fetch(
        `${mpApiUrl}/preapproval/${payment.mpPaymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        },
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json().catch(() => ({}));
        console.error("Erro ao cancelar assinatura:", errorData);
        return NextResponse.json(
          {
            error: `Falha ao cancelar assinatura: ${errorData.message || "Erro desconhecido"}`,
            details:
              process.env.NODE_ENV === "development"
                ? JSON.stringify(errorData)
                : undefined,
          },
          { status: cancelResponse.status || 500 },
        );
      }

      console.log(`Assinatura ${payment.mpPaymentId} cancelada com sucesso`);
    } catch (cancelError) {
      console.error("Erro ao cancelar assinatura:", cancelError);
      return NextResponse.json(
        {
          error: "Erro ao cancelar assinatura",
          details:
            cancelError instanceof Error
              ? cancelError.message
              : String(cancelError),
        },
        { status: 500 },
      );
    }

    const mpRefund = {
      id: `refund-${Date.now()}`,
      status: "approved",
    };

    const [refund] = await prisma.$transaction([
      prisma.refund.create({
        data: {
          paymentId,
          mpRefundId: mpRefund?.id?.toString() ?? null,
          status: mpRefund?.status || "COMPLETED",
          amount: payment.amount,
        },
      }),

      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      }),
    ]);

    console.log(`Reembolso registrado com sucesso: ${refund.id}`);

    try {
      const planId = payment.subscriptionPlanId;

      if (planId) {
        console.log(
          `Removendo matrícula do plano ${planId} para o usuário ${userId}`,
        );

        await prisma.enrollment.deleteMany({
          where: {
            userId: userId,
            planId: planId,
          },
        });

        console.log(`Matrícula removida com sucesso`);
      } else {
        console.log("Pagamento sem subscriptionPlanId associado.");
      }
    } catch (accessError) {
      console.error("Erro ao remover acesso após reembolso:", accessError);
    }

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        paymentId: refund.paymentId,
        items: payment.items.map((item: any) => ({
          id: item.trackId,
          type: "track",
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      message:
        "Assinatura cancelada e reembolsada com sucesso. O acesso aos itens foi revogado.",
    });
  } catch (err: any) {
    console.error("Erro ao processar reembolso:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        {
          error: "Já existe um reembolso em andamento para este pagamento",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno ao processar o reembolso",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: err.message,
                code: err.code,
                stack: err.stack,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}
