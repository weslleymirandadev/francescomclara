import { Metadata }  from "next";

export const metadata: Metadata = {
  title: "Perfil - Frances com Clara",
  description: "Página de perfil do usuário no aplicativo Francês com Clara.",
};

export default function PerfilLayout({
  children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--color-s-50)] pb-12 px-6">
      {children}
    </div>
  );
}