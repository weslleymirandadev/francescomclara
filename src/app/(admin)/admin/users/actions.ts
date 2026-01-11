"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const userWithPayments = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    payments: {
      include: {
        subscriptionPlan: true
      }
    }
  }
})

type UserWithRelations = Prisma.UserGetPayload<typeof userWithPayments>

export interface UserTableData {
  id: string
  name: string
  email: string | null
  plan: string
  status: "Ativo" | "Inativo"
  date: string
}

export async function getUsers(): Promise<UserTableData[]> {
  const users = await prisma.user.findMany({
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          subscriptionPlan: true 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return users.map((user: UserWithRelations): UserTableData => {
    const lastPayment = user.payments?.[0];
    
    return {
      id: user.id,
      name: user.name || "Sem nome",
      email: user.email,
      plan: lastPayment?.subscriptionPlan?.name || "Sem plano",
      status: lastPayment?.status === "PAID" ? "Ativo" : "Inativo",
      date: new Date(user.createdAt).toLocaleDateString('pt-BR')
    }
  })
}