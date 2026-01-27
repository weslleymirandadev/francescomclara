import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Nivelamento - ${siteName}`,
      description: "Teste de nivelamento para determinar o nível inicial do aluno.",
    }
  } catch (e) {
    return { title: "Nivelamento - Francês com Clara" }
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