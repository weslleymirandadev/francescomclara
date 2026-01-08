import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações - Francês com Clara",
  description: "Gerencie as configurações da plataforma Francês com Clara.",
};

export default function AdminSettingsLayout({
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