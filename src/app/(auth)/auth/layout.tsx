import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from '@/components/layout/Header';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    return {
      title: `Autenticação - ${settings?.siteName || "Francês com Clara"}`,
      description: "Área de autenticação para usuários acessarem suas contas com segurança.",
    }
  } catch (e) {
    return { title: "Autenticação - Francês com Clara" }
  }
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  return (
    <div className="min-h-screen bg-(--slate-50)">
      <Header settings={settings || undefined} />
      
      <main className="pt-10">
        {children}
      </main>
    </div>
  );
}