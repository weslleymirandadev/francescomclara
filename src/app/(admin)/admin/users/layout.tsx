import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuários - Francês com Clara",
  description: "Gerencie os alunos da plataforma Francês com Clara.",
};

export default function AdminUsersLayout({
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