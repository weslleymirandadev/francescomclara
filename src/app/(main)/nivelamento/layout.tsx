import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Nivelamento - ${siteName}`,
    description: "Realize o teste de nivelamento para identificar seu nível de proficiência em francês e receber recomendações personalizadas de estudo.",
  }
};

export default function levelingLayout({
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