import { prisma } from "@/lib/prisma";
import AdminSettings from "./AdminSettings";

export default async function Page() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  // Fornecer valores padrão se settings for null
  const defaultSettings = {
    siteName: "",
    supportEmail: "",
    stripeMode: false,
    maintenanceMode: false,
    instagramActive: false,
    instagramUrl: "",
    youtubeActive: false,
    youtubeUrl: "",
    whatsappActive: false,
    whatsappUrl: "",
    tiktokActive: false,
    tiktokUrl: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#3b82f6",
    description: "",
    keywords: "",
    analyticsId: "",
    facebookPixelId: "",
    googleTagManagerId: "",
    customCss: "",
    customJs: "",
    updatedAt: new Date(),
    id: "settings"
  };

  return <AdminSettings initialSettings={settings || defaultSettings} />;
}