import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Dashboard - ${siteName}`,
    description: "Visão geral do desempenho do seu site e acesso rápido às principais funcionalidades administrativas.",
  }
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <div className="min-h-screen bg-[var(--color-s-50)] px-6">
        {children}
      </div>
    );
}