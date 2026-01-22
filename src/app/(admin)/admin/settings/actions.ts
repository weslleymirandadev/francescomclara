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
        siteNameFirstPart: data.siteNameFirstPart,
        siteNameHighlight: data.siteNameHighlight,
        siteIcon: data.siteIcon,
        highlightColor: data.highlightColor,
        interfaceIcon: data.interfaceIcon,
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
        notifyNewModule: data.notifyNewModule,
        notifyPlanExpiring: data.notifyPlanExpiring,
        notifyInactivity: data.notifyInactivity,
        inactivityDays: data.inactivityDays,
      },
      create: {
        id: "settings",
        siteNameFirstPart: data.siteNameFirstPart,
        siteNameHighlight: data.siteNameHighlight,
        siteIcon: data.siteIcon,
        highlightColor: data.highlightColor,
        interfaceIcon: data.interfaceIcon,
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
        notifyNewModule: data.notifyNewModule || true,
        notifyPlanExpiring: data.notifyPlanExpiring || true,
        notifyInactivity: data.notifyInactivity || false,
        inactivityDays: data.inactivityDays || 7,
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