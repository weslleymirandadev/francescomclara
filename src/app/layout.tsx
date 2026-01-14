import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  return {
    title: settings?.siteName || "Francês com Clara",
    description: settings?.seoDescription || "Página de aprendizado de idiomas.",
    icons: {
      icon: settings?.interfaceIcon || '/static/favicon.svg',
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