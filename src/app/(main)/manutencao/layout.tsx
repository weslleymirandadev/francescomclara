import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Manutenção - ${siteName}`,
      description: "Estamos realizando melhorias no site. Voltaremos em breve!",
    }
  } catch (e) {
    return { title: "Manutenção - Francês com Clara" }
  }
};

export default function ManutencaoLayout({
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