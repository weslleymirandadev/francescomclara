import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAutomationEmail } from "@/lib/mail";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({ 
      where: { email: session.user.email },
      select: { id: true, welcomeEmailSent: true } 
    }),
    prisma.siteSettings.findUnique({ where: { id: "settings" } })
  ]);

  if (settings?.welcomeBackMessage && settings?.welcomeMessage && !user?.welcomeEmailSent) {
    
    const success = await sendAutomationEmail(
      session.user.email,
      `Bem-vindo(a) ao ${settings.siteName || 'Francês com Clara'}!`,
      settings.welcomeMessage
    );

    if (success) {
      await prisma.user.update({
        where: { id: user?.id },
        data: { welcomeEmailSent: true }
      });
      
      return NextResponse.json({ sent: true, message: settings.welcomeMessage });
    }
  }

  return NextResponse.json({ sent: false });
}