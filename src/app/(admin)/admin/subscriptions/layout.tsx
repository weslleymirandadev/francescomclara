import { Metadata } from 'next';
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";
  const description = settings?.seoDescription || "Aprenda francês de forma prática e cultural com a Clara.";

  return {
    title: `Planos - ${siteName}`,
    description: description,
  }
};

export default function AdminSubscriptionLayout({
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