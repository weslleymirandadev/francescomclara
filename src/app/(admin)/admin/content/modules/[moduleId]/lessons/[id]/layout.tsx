import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Aulas - ${siteName}`,
      description: "Gerencie e organize o conteúdo do seu site de forma eficiente e intuitiva.",
    }
  } catch (e) {
    return { title: "Aulas - Francês com Clara" }
  }
};

export default function AdminAnalyticsLayout({
  children,
}: {
    children: React.ReactNode;
    }) {
    return (
    <div className="min-h-screen pb-2">
        {children}
    </div>
    );
}
