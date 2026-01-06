import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Frances com Clara - Aprenda Idiomas",
  description: "Página de início do aplicativo de aprendizado de idiomas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body suppressHydrationWarning={true}>
        <Providers>
          <Header />
            <main className="pt-12">
              {children}
            </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
