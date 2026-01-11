import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ajuda - Francês Com Clara",
    description: "Página de ajuda do aplicativo Francês Com Clara.",
}

export default function AjudaLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[var(--color-s-50)] px-6">
            {children}
        </div>
    );
}