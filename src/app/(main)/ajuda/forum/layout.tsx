import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fórum - Francês Com Clara",
    description: "Fórum de discussão do aplicativo Francês Com Clara.",
}

export default function ForumLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            {children}
        </div>
    );
}
