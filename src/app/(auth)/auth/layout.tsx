import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from '@/components/layout/Header';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  return {
    title: `Autenticação - ${settings?.siteName || "Francês com Clara"}`,
    description: settings?.seoDescription,
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
    <div className="min-h-screen bg-[var(--color-s-50)]">
      <Header settings={settings || undefined} />
      
      <main className="pt-10">
        {children}
      </main>
    </div>
  );
}