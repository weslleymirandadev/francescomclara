import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Conteúdo - ${siteName}`,
    description: "Gerencie e organize o conteúdo do seu site de forma eficiente e intuitiva.",
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