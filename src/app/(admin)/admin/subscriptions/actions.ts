"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })
    // Garantir que todos os planos tenham o campo type (para compatibilidade com planos antigos)
    return plans.map((plan: any) => ({
      ...plan,
      type: plan.type || 'INDIVIDUAL'
    }))
  } catch (error) {
    console.error("Erro ao buscar planos:", error)
    return []
  }
}

export async function upsertSubscriptionPlan(data: any) {
  try {
    const { id, ...planData } = data
    
    // Garantir que type sempre tenha um valor válido
    if (!planData.type || !['INDIVIDUAL', 'FAMILY'].includes(planData.type)) {
      planData.type = 'INDIVIDUAL'
    }
    
    if (id) {
      await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: planData.name,
          price: planData.price,
          period: planData.period,
          active: planData.active,
          features: planData.features,
          type: planData.type || 'INDIVIDUAL',
        }
      })
    } else {
      await prisma.subscriptionPlan.create({
        data: {
          name: planData.name,
          price: planData.price,
          period: planData.period,
          active: planData.active,
          features: planData.features,
          type: planData.type || 'INDIVIDUAL',
        }
      })
    }

    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar plano:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

export async function deleteSubscriptionPlan(id: string) {
  try {
    await prisma.subscriptionPlan.delete({
      where: { id }
    })
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("Erro ao eliminar plano:", error)
    return { success: false }
  }
}

export async function togglePlanStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.subscriptionPlan.update({
      where: { id },
      data: { active: !currentStatus }
    })
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}