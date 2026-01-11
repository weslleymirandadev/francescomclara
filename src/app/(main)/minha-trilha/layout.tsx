import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Trilha - Aprenda Idiomas",
  description: "Página de Minha Trilha do aplicativo Francês com Clara.",
};

export default function MinhaTrilhaLayout({
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