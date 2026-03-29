import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Curso - ${siteName}`,
      description: "Acesse o conteúdo do curso e avance no seu aprendizado de francês com aulas estruturadas e interativas.",
    }
  } catch (e) {
    return { title: "Curso - Francês com Clara" }
  }
};

export default function ForumLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <div className="min-h-screen bg-white px-6">
        {children}
      </div>
    );
}