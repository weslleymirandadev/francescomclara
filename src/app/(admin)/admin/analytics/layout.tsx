import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Relatórios - ${siteName}`,
    description: "Acompanhe o desempenho do seu site com análises detalhadas e insights valiosos.",
  }
};

export default function AdminAnalyticsLayout({
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
