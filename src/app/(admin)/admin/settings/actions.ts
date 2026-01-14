"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return settings
  } catch (error) {
    return null
  }
}

export async function updateSettings(data: any) {
  try {
    const current = await prisma.siteSettings.findFirst()

    if (current) {
      await prisma.siteSettings.update({
        where: { id: current.id },
        data
      })
    } else {
      await prisma.siteSettings.create({
        data
      })
    }

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}