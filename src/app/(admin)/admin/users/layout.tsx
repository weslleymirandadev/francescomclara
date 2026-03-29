import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Usuários - ${siteName}`,
      description: "Gerencie os usuários registrados no seu site de forma eficiente e segura.",
    }
  } catch (e) {
    return { title: "Usuários - Francês com Clara" }
  }
};

export default function AdminUsersLayout({
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