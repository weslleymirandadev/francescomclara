import { Metadata }  from "next";

export const metadata: Metadata = {
    title: "Flashcards - Frances com Clara",
    description: "Página de flashcards do aplicativo Frances com Clara.",
};

export default function FlashcardsLayout({
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