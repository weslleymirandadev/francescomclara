import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Perfil - ${siteName}`,
      description: "Gerencie suas informações pessoais e preferências de conta no seu perfil de usuário.",
    }
  } catch (e) {
    return { title: "Perfil - Francês com Clara" }
  }
};

export default function PerfilLayout({
  children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-s-50 pb-12 px-6">
      {children}
    </div>
  );
}