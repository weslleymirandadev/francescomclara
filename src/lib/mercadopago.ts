import { prisma } from "@/lib/prisma";

export async function getMercadoPagoToken() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" },
  });

  const token = settings?.stripeMode
    ? process.env.MP_ACCESS_TOKEN_LIVE
    : process.env.MP_ACCESS_TOKEN_TEST;

  if (!token) {
    throw new Error("Token do Mercado Pago não configurado no .env");
  }

  return token;
}