import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Flashcards - ${siteName}`,
      description: "Pratique e aprimore seu vocabulário em francês com nossos flashcards interativos e eficazes.",
    }
  } catch (e) {
    return { title: "Flashcards - Francês com Clara" }
  }
};

export default function FlashcardsLayout({
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