import prisma from "@/lib/prisma";
import AdminTestList from "./components/AdminTestList";

export default async function AdminTestPage() {
  const test = await prisma.placementTest.findFirst() || await prisma.placementTest.create({ data: { title: "Teste Principal" } });
  
  const questions = await prisma.question.findMany({ 
    where: { testId: test.id },
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto mb-20 md:mb-0">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">
          Gerenciar Teste
        </h1>
        <p className="hidden sm:block text-slate-500 text-sm">Configure as perguntas do teste inicial.</p>
      </header>

      <AdminTestList initialQuestions={questions} testId={test.id} />
    </div>
  );
}