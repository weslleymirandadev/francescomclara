import "./globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { prisma } from "@/lib/prisma";
import { Toaster } from "react-hot-toast";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" },
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: siteName,
      description: "Aprenda francês de forma prática e cultural com a Clara.",
      icons: {
        icon: settings?.favicon || "/static/favicon.svg",
        shortcut: settings?.favicon || "/static/favicon.svg",
        apple: settings?.favicon || "/static/favicon.svg",
      },
    };
  } catch (error) {
    return {
      title: "Francês com Clara",
      description: "Aprenda francês de forma prática e cultural.",
      icons: { icon: "/static/favicon.svg" },
    };
  }
}

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" },
    });

    return {
      siteIcon: settings?.siteIcon || "/static/flower.svg",
      highlightColor: settings?.highlightColor || "--clara-rose",
    };
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return {
      siteIcon: "/static/flower.svg",
      highlightColor: "--clara-rose",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50">
        <Providers>
          {children}
          <main className="flex-1 w-full relative"></main>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
