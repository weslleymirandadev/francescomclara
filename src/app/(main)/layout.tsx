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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow pt-12">{children}</main>

      <Footer settings={settings!} />
    </div>
  );
}
