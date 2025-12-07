import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const {
      type, // "course" | "journey"
      courseId,
      journeyId,
      token,
      method,
      installments,
      payer,
      userId,
      issuer_id,
      device_id,
      durationMonths = 12,
    } = await req.json();

    if (!type || !["course", "journey"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    // Carregar título/descrição automaticamente
    let title = "";
    let amount = 0;
    let imageUrl: string | null = null;

    if (type === "course") {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course)
        return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });

      title = course.title;
      amount = course.price!;
      imageUrl = course.imageUrl ?? null;
    }

    if (type === "journey") {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
      });

      if (!journey)
        return NextResponse.json({ error: "Jornada não encontrada" }, { status: 404 });

      title = `Jornada: ${journey.title}`;
      amount = journey.price!;
    }

    const payment = new Payment(mp);

    const mpData = {
      transaction_amount: amount,
      payment_method_id: method,
      installments,
      issuer_id: issuer_id,
      ...(token && { token }),
      ...(method === "pix" && {
        transaction_details: {
          financial_institution: "pix",
        },
      }),
      payer: {
        type: "customer",
        entity_type: "individual",
        email: payer.email,
        ...(payer.firstName || payer.name
          ? { first_name: payer.firstName ?? payer.name.split(" ")[0] }
          : {}),
        ...(payer.lastName || payer.name
          ? {
              last_name:
                payer.lastName ??
                ((): string => {
                  const parts = payer.name?.split(" ") ?? [];
                  return parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? "";
                })(),
            }
          : {}),
        identification: {
          type: "CPF",
          number: payer.cpf,
        },
      },
      description: title,
      external_reference: `${type}:${type === "course" ? courseId : journeyId}`,
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/mercado-pago/webhook`,
      metadata: {
        userId,
        type,
        id: type === "course" ? courseId : journeyId,
        durationMonths,
      },
      statement_descriptor: "PROGRAMAÇÃO DEV",
      binary_mode: true,
      capture: true,
      additional_info: {
        items: [
          {
            id: type === "course" ? courseId : journeyId,
            title,
            description:
              type === "course"
                ? "Curso online Programacao.Dev"
                : "Jornada de estudos Programacao.Dev",
            category_id: type,
            quantity: 1,
            picture_url: imageUrl ?? undefined,
            unit_price: amount,
          },
        ],
      },

    };

    const result = await payment.create({
      body: mpData,
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
        meliSessionId: device_id,
      },
    });

    let statusLabel: "success" | "pending" | "rejected";

    if (result.status === "approved") {
      statusLabel = "success";
    } else if (["in_process", "pending"].includes(result.status as string)) {
      statusLabel = "pending";
    } else {
      statusLabel = "rejected";
    }

    return NextResponse.json({
      payment_id: result.id,
      status: result.status,
      statusLabel,
      pix:
        method === "pix"
          ? {
              qr_base64:
                result.point_of_interaction?.transaction_data?.qr_code_base64,
              qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            }
          : undefined,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
