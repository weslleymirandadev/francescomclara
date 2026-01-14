import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conteúdo - Francês com Clara",
  description: "Gerencie o conteúdo da plataforma Francês com Clara.",
};

export default function AdminContentLayout({
    children,
}: {
    children: React.ReactNode;
    }) {
    return (
    <div className="min-h-screen">
        {children}
    </div>
    );
}