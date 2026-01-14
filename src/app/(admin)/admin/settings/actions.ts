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
    await prisma.siteSettings.upsert({
      where: { id: "settings" },
      update: {
        siteName: data.siteName,
        supportEmail: data.supportEmail,
        stripeMode: data.stripeMode,
        maintenanceMode: data.maintenanceMode,
        instagramActive: data.instagramActive,
        instagramUrl: data.instagramUrl,
        youtubeActive: data.youtubeActive,
        youtubeUrl: data.youtubeUrl,
        whatsappActive: data.whatsappActive,
        whatsappUrl: data.whatsappUrl,
        tiktokActive: data.tiktokActive,
        tiktokUrl: data.tiktokUrl,
      },
      create: {
        id: "settings",
        siteName: data.siteName,
        supportEmail: data.supportEmail,
        stripeMode: data.stripeMode,
        maintenanceMode: data.maintenanceMode,
        instagramActive: data.instagramActive,
        instagramUrl: data.instagramUrl,
        youtubeActive: data.youtubeActive,
        youtubeUrl: data.youtubeUrl,
        whatsappActive: data.whatsappActive,
        whatsappUrl: data.whatsappUrl,
        tiktokActive: data.tiktokActive,
        tiktokUrl: data.tiktokUrl,
      }
    });

    revalidatePath("/admin/settings");
    revalidatePath("/"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return { success: false };
  }
}