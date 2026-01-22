"use server"

import { prisma } from "@/lib/prisma"

export async function getGlobalData() {
  try {
    // 1. Tenta buscar as configurações e planos simultaneamente
    const [settings, plans] = await Promise.all([
      prisma.siteSettings.findUnique({ 
        where: { id: "settings" } 
      }),
      prisma.subscriptionPlan.findMany({ 
        where: { active: true }, 
        orderBy: { price: 'asc' } 
      })
    ]);

    // 2. Log de debug no terminal do VS Code
    console.log(`[DB LOAD] Configs: ${settings ? 'OK' : 'MISSING'}, Planos: ${plans.length}`);

    return { 
      settings: settings || null, 
      plans: plans || [] 
    };
  } catch (error) {
    // 3. Captura qualquer erro de conexão com o banco
    console.error("ERRO AO CARREGAR DADOS DO BANCO:", error);
    return { settings: null, plans: [] };
  }
}