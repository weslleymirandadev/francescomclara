import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Minha Trilha - Aprenda Idiomas",
  description: "Página de Minha Trilha do aplicativo Francês com Clara.",
};

export default async function MinhaTrilhaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  // Se não estiver logado, redirecionar para login
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Verificar se tem plano ativo
  const hasSubscription = await hasActiveSubscription(session.user.id);
  
  if (!hasSubscription) {
    redirect("/assinar");
  }

  return (
    <div className="min-h-screen bg-s-50 px-6">   
        {children}
    </div>
  );
}