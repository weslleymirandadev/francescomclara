import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getGlobalData } from "./actions/settings";

export default async function MainPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await getGlobalData();
  
  return (
    <div>
      <Header />
        <main className="pt-12">
          {children}
        </main>
      <Footer settings={settings!} />
    </div>
  );
}
