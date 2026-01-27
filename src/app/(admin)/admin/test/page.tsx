import prisma from "@/lib/prisma";
import AdminTestList from "./components/AdminTestList";

export default async function AdminTestPage() {
  const test = await prisma.placementTest.findFirst() || await prisma.placementTest.create({ data: { title: "Teste Principal" } });
  
  const questions = await prisma.question.findMany({ 
    where: { testId: test.id },
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
          Gerenciar Teste de Nivelamento
        </h1>
        <p className="text-slate-500 text-sm">Configure as perguntas do teste inicial.</p>
      </header>

      <AdminTestList initialQuestions={questions} testId={test.id} />
    </div>
  );
}