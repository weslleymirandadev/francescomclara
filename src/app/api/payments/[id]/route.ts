import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findFirst({
      where: {
        mpPaymentId: id,
      },
      include: {
        subscriptionPlan: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar pagamento" },
      { status: 500 },
    );
  }
}
