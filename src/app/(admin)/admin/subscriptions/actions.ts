"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })
    // Garantir que todos os planos tenham os campos necessários (para compatibilidade com planos antigos)
    return plans.map((plan: any) => ({
      ...plan,
      type: plan.type || 'INDIVIDUAL',
      monthlyPrice: plan.monthlyPrice || plan.price || 0,
      yearlyPrice: plan.yearlyPrice || (plan.price ? plan.price * 12 : 0)
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
    
    // Validar que o preço anual dividido por 12 seja menor que o mensal
    const monthlyPrice = planData.monthlyPrice || planData.price || 0;
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
      // Compatibilidade: sempre incluir price usando monthlyPrice como fallback
      price: Math.round(planData.price !== undefined ? planData.price : monthlyPrice),
      // Compatibilidade: sempre incluir period, usar MONTHLY como padrão se não fornecido
      period: planData.period || 'MONTHLY',
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