import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMercadoPagoToken } from "@/lib/mercadopago";

export async function POST(req: Request) {
  const mpAccessToken = await getMercadoPagoToken();

  try {
    const body = await req.json();

    const {
      payer,
      userId,
      items,
      total,
      subscriptionPlanId,
      token: card_token_id,
      method,
      installments = 1,
      frequencyType: initialFrequencyType = "months",
      frequency: initialFrequency = 1,
      period,
      cardData,
    } = body;

    let frequencyType = initialFrequencyType;
    let frequency = initialFrequency;
    let finalPeriod: "MONTHLY" | "YEARLY" = period || "MONTHLY";

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    if (!payer?.email) {
      return NextResponse.json(
        { error: "Email do pagador é obrigatório" },
        { status: 400 },
      );
    }

    let subscriptionPlan = null;
    if (subscriptionPlanId) {
      subscriptionPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId },
        include: { tracks: { include: { track: true } } },
      });

      if (!subscriptionPlan) {
        return NextResponse.json(
          { error: "Plano de assinatura não encontrado" },
          { status: 404 },
        );
      }

      if (finalPeriod === "MONTHLY") {
        frequencyType = "months";
        frequency = 1;
      } else if (finalPeriod === "YEARLY") {
        frequencyType = "months";
        frequency = 12;
      }
    } else if (period) {
      finalPeriod = period;
      if (finalPeriod === "MONTHLY") {
        frequencyType = "months";
        frequency = 1;
      } else if (finalPeriod === "YEARLY") {
        frequencyType = "months";
        frequency = 12;
      }
    }

    const isTransparent = !!card_token_id;

    interface IncomingItem {
      id: string;
      title: string;
      price: number;
      quantity: number;
      imageUrl?: string;
      description?: string;
    }

    const trackIds = items.map((item: IncomingItem) => item.id);
    const existingTracks = await prisma.track.findMany({
      where: { id: { in: trackIds } },
      select: { id: true, name: true },
    });

    const existingTrackIds = new Set(existingTracks.map((t: any) => t.id));
    const missingTracks = trackIds.filter(
      (id: any) => !existingTrackIds.has(id),
    );

    if (missingTracks.length > 0) {
      return NextResponse.json(
        { error: `Trilhas não encontradas: ${missingTracks.join(", ")}` },
        { status: 404 },
      );
    }

    const enrichedItems = items.map((item: IncomingItem) => {
      const track = existingTracks.find((t: any) => t.id === item.id);
      return {
        ...item,
        title: track?.name || item.title,
        price: item.price || 0,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || "",
      };
    });

    let calculatedTotalInCents: number;
    if (subscriptionPlan) {
      if (subscriptionPlan.discountEnabled && subscriptionPlan.discountPrice) {
        calculatedTotalInCents = subscriptionPlan.discountPrice;
      } else {
        calculatedTotalInCents =
          finalPeriod === "YEARLY"
            ? subscriptionPlan.yearlyPrice || 0
            : subscriptionPlan.monthlyPrice || 0;
      }
    } else {
      calculatedTotalInCents =
        total ||
        enrichedItems.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0,
        );
    }
    const calculatedTotalInReais = calculatedTotalInCents / 100;

    const description = subscriptionPlan
      ? subscriptionPlan.name
      : enrichedItems.length === 1
        ? `Assinatura: ${enrichedItems[0].title}`
        : `Assinatura: ${enrichedItems.length} trilhas`;

    const externalReference = `subscription-${userId}-${Date.now()}`;

    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 10);

    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const meliSessionId = req.headers.get("X-meli-session-id");

    const mpApiUrl = process.env.MP_API_URL || "https://api.mercadopago.com";
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpAccessToken}`,
      "X-Idempotency-Key": crypto.randomUUID(),
    };

    if (meliSessionId) {
      headers["X-meli-session-id"] = meliSessionId;
    }

    const subscriptionData: any = {
      reason: "Assinatura Francês com Clara",
      payer_email: payer.email,
      card_token_id: card_token_id,
      auto_recurring: {
        frequency: frequency,
        frequency_type: frequencyType,
        transaction_amount: calculatedTotalInReais,
        currency_id: "BRL",
        start_date: startDate.toISOString(),
      },
      back_url: `${process.env.NEXT_PUBLIC_URL}/assinar/sucesso`,
      status: isTransparent ? "authorized" : "pending",
      external_reference: `sub-${userId}-${Date.now()}`,
      payer: {
        email: payer.email,
        first_name: payer.first_name || payer.firstName,
        last_name: payer.last_name || payer.lastName,
        identification: {
          type: "CPF",
          number: payer.cpf?.replace(/\D/g, ""),
        },
      },
    };

    if (isTransparent) {
      subscriptionData.card_token_id = card_token_id;
      if (method) subscriptionData.payment_method_id = method;
    }

    const response = await fetch(`${mpApiUrl}/preapproval`, {
      method: "POST",
      headers,
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao criar assinatura no Mercado Pago:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return NextResponse.json(
        {
          error: "Erro ao processar assinatura no gateway",
          details:
            process.env.NODE_ENV === "development"
              ? JSON.stringify(errorData)
              : undefined,
        },
        { status: response.status || 500 },
      );
    }

    const subscriptionResponse = await response.json();

    if (!subscriptionResponse?.id) {
      console.error("Resposta do Mercado Pago sem ID:", subscriptionResponse);
      return NextResponse.json(
        { error: "Falha ao processar assinatura no gateway" },
        { status: 500 },
      );
    }

    const mpSubscriptionId = subscriptionResponse.id.toString();
    const isAuthorized = subscriptionResponse.status === "authorized";

    console.log("Assinatura criada com sucesso:", {
      id: mpSubscriptionId,
      status: subscriptionResponse.status,
      isAuthorized,
      init_point: subscriptionResponse.init_point,
    });

    const enrollmentEndDate = new Date();
    if (finalPeriod === "YEARLY") {
      enrollmentEndDate.setFullYear(enrollmentEndDate.getFullYear() + 1);
    } else {
      enrollmentEndDate.setMonth(enrollmentEndDate.getMonth() + 1);
    }

    const statusMapping: Record<string, string> = {
      authorized: "APPROVED",
      approved: "APPROVED",
      pending: "PENDING",
      rejected: "REJECTED",
      cancelled: "CANCELLED",
    };

    const finalStatus = statusMapping[subscriptionResponse.status] || "PENDING";

    const payment = await prisma.payment.create({
      data: {
        userId,
        mpPaymentId: mpSubscriptionId,
        status: finalStatus,
        amount: calculatedTotalInCents,
        subscriptionPlanId: subscriptionPlan?.id || null,
        metadata: {
          type: "subscription",
          isTransparent: isTransparent,
          ...(method && { paymentMethod: method }),
          ...(installments > 1 && { installments }),
          frequency,
          frequencyType,
          period: finalPeriod,
          refundWindowDays: finalPeriod === "YEARLY" ? 30 : 7, // Janela de reembolso
          items: enrichedItems.map((item: IncomingItem) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          external_reference: externalReference,
          ...(subscriptionResponse.init_point && {
            init_point: subscriptionResponse.init_point,
          }),
          ...(subscriptionResponse.sandbox_init_point && {
            sandbox_init_point: subscriptionResponse.sandbox_init_point,
          }),
        },
        items: {
          create: enrichedItems.map((item: IncomingItem) => ({
            trackId: item.id,
            price: item.price,
            quantity: item.quantity,
            title: item.title,
            description: item.description || `Trilha: ${item.title}`,
          })),
        },
      },
    });

    // Se for checkout transparente e tiver dados do cartão, salvar método de pagamento
    if (isTransparent && mpAccessToken && cardData) {
      try {
        // Verificar se já existe um método padrão para este usuário
        const existingDefault = await prisma.paymentMethod.findFirst({
          where: {
            userId,
            isDefault: true,
            isActive: true,
          },
        });

        // Extrair últimos 4 dígitos do número do cartão
        const cardNumber = cardData.cardNumber?.replace(/\s/g, "") || "";
        const last4Digits = cardNumber.slice(-4);

        // Parse da data de validade
        const expiry = cardData.expiry || "";
        const [expiryMonth, expiryYear] = expiry.split("/");
        const expiryYearFull = expiryYear
          ? parseInt(`20${expiryYear}`)
          : new Date().getFullYear() + 1;
        const expiryMonthNum = expiryMonth ? parseInt(expiryMonth) : 12;

        // Salvar método de pagamento
        await prisma.paymentMethod.create({
          data: {
            userId,
            paymentId: payment.id,
            last4Digits: last4Digits || "****",
            brand: method || "unknown",
            holderName: cardData.holderName || payer.name || "",
            expiryMonth: expiryMonthNum,
            expiryYear: expiryYearFull,
            mpCardToken: mpAccessToken,
            isDefault: !existingDefault, // Primeiro cartão é padrão
            isActive: true,
            metadata: {
              installments: installments > 1 ? installments : undefined,
            },
          },
        });

        console.log(
          "Método de pagamento salvo com sucesso para assinatura transparente",
        );
      } catch (paymentMethodError) {
        console.error(
          "Erro ao salvar método de pagamento:",
          paymentMethodError,
        );
        // Não falhar a criação da assinatura se houver erro ao salvar o método de pagamento
      }
    }

    // Conceder acesso
    if (isAuthorized) {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          planId: subscriptionPlanId,
        },
      });

      await prisma.enrollment.upsert({
        where: {
          id: existingEnrollment?.id || "new-id",
        },
        create: {
          userId,
          planId: subscriptionPlanId,
          startDate: new Date(),
          endDate: enrollmentEndDate,
        },
        update: {
          endDate: enrollmentEndDate,
        },
      });
    }

    return NextResponse.json({
      id: subscriptionResponse.id,
      status: subscriptionResponse.status,
      init_point: subscriptionResponse.init_point,
      sandbox_init_point: subscriptionResponse.sandbox_init_point,
      external_reference: externalReference,
      isTransparent: isTransparent,
      requiresRedirect:
        !isTransparent || subscriptionResponse.status !== "authorized",
    });
  } catch (err) {
    console.error("Erro ao processar assinatura:", err);
    return NextResponse.json(
      {
        error: "Erro ao processar assinatura",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
