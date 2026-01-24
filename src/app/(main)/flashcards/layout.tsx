import { Metadata }  from "next";
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";

  return {
    title: `Flashcards - ${siteName}`,
    description: "Pratique e aprimore seu vocabulário em francês com nossos flashcards interativos e eficazes.",
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