import { Header } from "@/components/Header";
import "./globals.css";
import { Providers } from "./providers";

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
        </Providers>
      </body>
    </html>
  );
}
