import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    // 1. Pega o token da sessão atual para saber quem é você
    const token = await getToken({ 
      req: req as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.sub) {
      return NextResponse.json({ error: "Você precisa estar logado!" }, { status: 401 });
    }

    const userId = token.sub;

    // 2. Busca a primeira trilha ativa disponível no banco
    const track = await prisma.track.findFirst({
      where: { active: true }
    });

    if (!track) {
      return NextResponse.json({ error: "Nenhuma trilha ativa encontrada no banco." }, { status: 404 });
    }

    // 3. Cria a matrícula (Enrollment) com data de validade longa
    await prisma.enrollment.upsert({
      where: {
        userId_trackId: {
          userId: userId,
          trackId: track.id,
        },
      },
      update: {
        endDate: new Date("2030-12-31"),
      },
      create: {
        userId: userId,
        trackId: track.id,
        endDate: new Date("2030-12-31"),
      },
    });

    // 4. Cria um registro de pagamento aprovado para "limpar" o proxy
    await prisma.payment.create({
      data: {
        userId: userId,
        mpPaymentId: `debug_free_${Date.now()}`,
        status: "approved",
        amount: 0,
      }
    });

    return NextResponse.json({ 
      message: "🔥 ACESSO LIBERADO! Você agora é Premium.",
      track: track.name,
      expires: "2030"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao liberar acesso." }, { status: 500 });
  }
}