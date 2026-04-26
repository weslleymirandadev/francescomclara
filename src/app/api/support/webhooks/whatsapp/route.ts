import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupportOpen } from "@/lib/utils";
import { redis } from "@/lib/redis";

interface SiteSettings {
  supportStatus: boolean;
  supportAwayMessage: string;
  supportStartTime: string;
  supportEndTime: string;
  supportDays: string;
}

export async function POST(req: Request) {
  const headers = req.headers;
  const apiKey = headers.get("apikey");

  if (apiKey !== process.env.EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cachedSettings = await redis.get("site-settings");
  let settings: SiteSettings | null = null;

  const body = await req.json();

  if (!cachedSettings) {
    const dbSettings = await prisma.siteSettings.findFirst();
    if (dbSettings) {
      settings = dbSettings as unknown as SiteSettings;
      await redis.set("site-settings", JSON.stringify(settings), { ex: 300 });
    }
  } else {
    settings =
      typeof cachedSettings === "string"
        ? JSON.parse(cachedSettings)
        : (cachedSettings as SiteSettings);
  }

  if (settings && !isSupportOpen(settings)) {
    const remoteJid = body.data?.key?.remoteJid;
    if (!body.data?.key?.fromMe && remoteJid) {
      await sendMessage(remoteJid, settings.supportAwayMessage);
    }
    return NextResponse.json({ ok: true });
  }

  const messageText =
    body.data?.message?.conversation ||
    body.data?.message?.extendedTextMessage?.text ||
    "";

  const emailMatch = messageText.match(/\*E-mail:\*\s*([^\n\s]+)/i);
  const tokenMatch = messageText.match(/\*Token:\*\s*([A-Z0-9]{6})/i);

  if (emailMatch && tokenMatch) {
    const email = emailMatch[1];
    const receivedToken = tokenMatch[1];

    const expectedToken = Buffer.from(`${email}-${new Date().getDay()}`)
      .toString("base64")
      .slice(0, 6)
      .toUpperCase();

    if (receivedToken !== expectedToken) {
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        supportTickets: {
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (user?.hasPrioritySupport && user.supportTickets.length > 0) {
      const ticketId = user.supportTickets[0].id;

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "IN_PROGRESS",
          updatedAt: new Date(),
        },
      });

      const remoteJid = body.data?.key?.remoteJid;
      const msgSucesso = `Olá, ${user.name.split(" ")[0]}! Seu ticket foi recebido com sucesso.\n\nA Clara já foi notificada e em breve você receberá uma resposta por aqui! 🇫🇷`;

      await sendMessage(remoteJid, msgSucesso);
    } else if (!user?.hasPrioritySupport) {
      console.log(`Tentativa de acesso não-VIP: ${email}`);
    }
  }

  return NextResponse.json({ ok: true });
}

async function sendMessage(remoteJid: string, text: string) {
  const url = `${process.env.NEXT_PUBLIC_EVOLUTION_URL}/message/sendText/${process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY || "",
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1000, presence: "composing" },
        textMessage: { text: text },
      }),
    });
  } catch (err) {
    console.error("Erro Evolution API:", err);
  }
}
