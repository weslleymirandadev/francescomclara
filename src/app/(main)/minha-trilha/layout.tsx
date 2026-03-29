import { Metadata } from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Minha Trilha - ${siteName}`,
      description: "Monitore seu progresso e conquiste seus objetivos de aprendizado com a Minha Trilha personalizada.",
    }
  } catch (e) {
    return { title: "Fórum - Francês com Clara" }
  }
};

export default function MinhaTrilhaLayout({
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