import { Metadata } from 'next';
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Planos - ${siteName}`,
    description: "Gerencie os planos de assinatura disponíveis para seus usuários de forma eficaz.",
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