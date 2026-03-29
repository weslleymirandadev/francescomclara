import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {  
      title: `Nivelamento - ${siteName}`,
      description: "Realize o teste de nivelamento para identificar seu nível de proficiência em francês e receber recomendações personalizadas de estudo.",
    }
  } catch (e) {
    return { title: "Nivelamento - Francês com Clara" }
  }
};

export default function levelingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <div className="min-h-screen bg-(--slate-50) px-6">
        {children}
      </div>
    );
}