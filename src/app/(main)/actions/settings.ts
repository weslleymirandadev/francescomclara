"use server"

import { prisma } from "@/lib/prisma"

export async function getGlobalData() {
  try {
    const [settings, plans] = await Promise.all([
      prisma.siteSettings.findUnique({ 
        where: { id: "settings" } 
      }),
      prisma.subscriptionPlan.findMany({ 
        where: { active: true }, 
        orderBy: { monthlyPrice: 'asc' } 
      })
    ]);

    console.log(`[DB LOAD] Configs: ${settings ? 'OK' : 'MISSING'}, Planos: ${plans.length}`);

    return { 
      settings: settings || null, 
      plans: plans || [] 
    };
  } catch (error) {
    console.error("ERRO AO CARREGAR DADOS DO BANCO:", error);
    return { settings: null, plans: [] };
  }
}