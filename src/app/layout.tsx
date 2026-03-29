import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" }
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: siteName,
      description: "Aprenda francês de forma prática e cultural com a Clara.",
      icons: {
        icon: settings?.favicon || '/static/favicon.svg', 
        shortcut: settings?.favicon || '/static/favicon.svg',
        apple: settings?.favicon || '/static/favicon.svg',
      },
    };
  } catch (error) {
    return {
      title: "Francês com Clara",
      description: "Aprenda francês de forma prática e cultural.",
      icons: { icon: '/static/favicon.svg' }
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}