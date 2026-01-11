import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function MainPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteSettings.findFirst({
    where: { id: "settings" }
  });
  
  return (
    <div>
      <Header />
        <main className="pt-12">
          {children}
        </main>
      <Footer settings={settings} />
    </div>
  );
}
