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
    <div className="min-h-screen pb-2 md:px-6">
        {children}
    </div>
    );
}