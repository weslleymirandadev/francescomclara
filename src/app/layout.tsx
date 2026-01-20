import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";
  const description = settings?.seoDescription || "Aprenda francês de forma prática e cultural com a Clara.";

  return {
    title: siteName,
    description: description,
    icons: {
      icon: settings?.favicon || '/static/favicon.svg', 
      shortcut: settings?.favicon || '/static/favicon.svg',
      apple: settings?.favicon || '/static/favicon.svg',
    },
  };
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