"use server"

import { prisma } from "@/lib/prisma"

export async function getGlobalData() {
  const [settings, plans] = await Promise.all([
    prisma.siteSettings.findFirst({ where: { id: "settings" } }),
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } })
  ]);

  return { settings, plans };
}