import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";
  const description = settings?.seoDescription || "Aprenda francês de forma prática e cultural com a Clara.";

  return {
    title: `Conteúdo - ${siteName}`,
    description: description,
  }
};

export default function AdminContentLayout({
    children,
}: {
    children: React.ReactNode;
    }) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
}