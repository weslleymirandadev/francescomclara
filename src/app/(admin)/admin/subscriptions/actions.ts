"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPrice: 'asc' }
    })
    // Garantir que todos os planos tenham os campos necessários (para compatibilidade com planos antigos)
    return plans.map((plan: any) => ({
      ...plan,
      type: plan.type || 'INDIVIDUAL',
      monthlyPrice: plan.monthlyPrice || 0,
      yearlyPrice: plan.yearlyPrice || 0,
    }))
  } catch (error) {
    console.error("Erro ao buscar planos:", error)
    return []
  }
}

export async function upsertSubscriptionPlan(data: any) {
  try {
    const { id, ...planData } = data
    
    if (!planData.type || !['INDIVIDUAL', 'FAMILY'].includes(planData.type)) {
      planData.type = 'INDIVIDUAL'
    }
    
    const monthlyPrice = planData.monthlyPrice || 0;
    const yearlyPrice = planData.yearlyPrice || 0;
    
    if (yearlyPrice > 0) {
      const yearlyMonthlyPrice = Math.round(yearlyPrice / 12);
      if (yearlyMonthlyPrice >= monthlyPrice) {
        return { 
          success: false, 
          error: 'O preço anual deve ser mais barato que o mensal (preço anual/12 < preço mensal)' 
        };
      }
    }
    
    const updateData: any = {
      name: planData.name,
      monthlyPrice: Math.round(monthlyPrice),
      yearlyPrice: Math.round(yearlyPrice),
      active: planData.active,
      features: planData.features,
      type: planData.type || 'INDIVIDUAL',
      isBestValue: planData.isBestValue || false,
      description: planData.description || ''
    };
    
    if (id) {
      await prisma.subscriptionPlan.update({
        where: { id },
        data: updateData
      })
    } else {
      await prisma.subscriptionPlan.create({
        data: updateData
      })
    }

    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar plano:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

export async function deleteSubscriptionPlan(id: string) {
  try {
    // Verificar se o plano existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        payments: true,
        tracks: true
      }
    })

    if (!plan) {
      return { success: false, error: "Plano não encontrado" }
    }

    // Verificar se há pagamentos associados
    if (plan.payments.length > 0) {
      return { 
        success: false, 
        error: `Não é possível excluir este plano pois há ${plan.payments.length} pagamento(s) associado(s).` 
      }
    }

    await prisma.subscriptionPlan.delete({
      where: { id }
    })
    
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("Erro ao eliminar plano:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir o plano" 
    }
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