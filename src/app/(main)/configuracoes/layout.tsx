import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações - Francês com Clara",
  description: "Gerencie suas preferências e dados de conta.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-s-50)] pb-12 px-6">
      {children}
    </div>
  );
}