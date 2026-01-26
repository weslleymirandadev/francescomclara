import prisma from "@/lib/prisma";

async function liberarAcessoTotal(userId: string, planId: string, trackId: string) {
  // 1. Cria um pagamento aprovado para o plano
  await prisma.payment.create({
    data: {
      userId: userId,
      mpPaymentId: `fake_pay_${Date.now()}`,
      status: "approved",
      amount: 0,
      subscriptionPlanId: planId,
    }
  });

  // 2. Cria a matrícula na trilha (o que o proxy.ts realmente checa)
  await prisma.enrollment.upsert({
    where: {
      userId_trackId: {
        userId: userId,
        trackId: trackId,
      },
    },
    update: {
      endDate: new Date("2030-01-01"), // Acesso até 2030
    },
    create: {
      userId: userId,
      trackId: trackId,
      endDate: new Date("2030-01-01"),
    },
  });

  console.log("Acesso liberado com sucesso!");
}