import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Frances com Clara - Aprenda Idiomas",
  description: "Página de início do aplicativo de aprendizado de idiomas.",
  icons: {
    icon: '/static/favicon.svg',
    shortcut: '/static/favicon.svg',
    apple: '/static/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}