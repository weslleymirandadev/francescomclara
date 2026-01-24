import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Configurações - ${siteName}`,
    description: "Personalize as configurações do seu site para melhor atender às suas necessidades administrativas.",
  }
};

export default function AdminSettingsLayout({
  children,
}: {
    children: React.ReactNode;
    }) {
    return (
      <div className="min-h-screen pb-2 md:px-6">
        {children}
      </div>
    );
}