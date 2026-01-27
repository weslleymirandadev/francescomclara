import prisma from "@/lib/prisma";
import TestQuiz from "./components/TestQuiz";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NivelamentoPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  if ((session.user as any).onboarded) {
    redirect("/dashboard");
  }

  const questions = await prisma.question.findMany({
    orderBy: { id: 'asc' }
  });

  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase italic">Teste de Nivelamento</h1>
          <p className="text-slate-500">Descobre o teu nível de francês e começa a estudar.</p>
        </div>

        <TestQuiz initialQuestions={questions} />
      </div>
    </main>
  );
}