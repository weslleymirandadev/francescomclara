import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendAutomationEmail } from "@/lib/mail";

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const settings = await prisma.siteSettings.findUnique({ 
    where: { id: "settings" } 
  });

  if (!settings) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  let inactivitySent = 0;
  let expiringSent = 0;
  let flashcardsSent = 0;
  let welcomeSent = 0;

  if (settings.notifyInactivity && settings.inactivityMessage) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - settings.inactivityDays);

    const inactiveUsers = await prisma.user.findMany({
      where: { updatedAt: { lte: thresholdDate } }
    });

    for (const user of inactiveUsers) {
      const success = await sendAutomationEmail(
        user.email, 
        "Sentimos sua falta!", 
        settings.inactivityMessage
      );
      if (success) inactivitySent++;
    }
  }

  if (settings.welcomeBackMessage && settings.welcomeMessage) {
    const newUsers = await prisma.user.findMany({
      where: {
        welcomeEmailSent: false,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    for (const user of newUsers) {
      const success = await sendAutomationEmail(
        user.email!,
        `Bem-vindo(a) ao ${settings.siteName || 'Francês com Clara'}!`,
        settings.welcomeMessage
      );
      if (success) {
        await prisma.user.update({
          where: { id: user.id },
          data: { welcomeEmailSent: true }
        });
        welcomeSent++;
      }
    }
  }

  const usersWithCards = await prisma.user.findMany({
    where: {
      flashcards: { some: {} },
    },
    include: {
      _count: {
        select: { flashcards: true }
      }
    }
  });

  for (const user of usersWithCards) {
    if (user.email) {
      const success = await sendAutomationEmail(
        user.email,
        "🇫🇷 Hora da Revisão!",
        `Olá! Você tem ${user._count.flashcards} flashcards esperando por você. Pratique um pouco hoje para não esquecer o que aprendeu!`
      );
      if (success) flashcardsSent++;
    }
  }

  if (settings.notifyPlanExpiring && settings.expiringMessage) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + settings.daysToNotifyExpiring);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const enrollments = await prisma.enrollment.findMany({
      where: { endDate: { gte: targetDate, lt: nextDay } },
      include: { user: true }
    });

    for (const item of enrollments) {
      if (item.user?.email) {
        const success = await sendAutomationEmail(
          item.user.email, 
          "Seu plano está vencendo", 
          settings.expiringMessage
        );
        if (success) expiringSent++;
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    stats: { inactivitySent, expiringSent, flashcardsSent, welcomeSent } 
  });
}