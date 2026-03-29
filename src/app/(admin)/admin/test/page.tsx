import prisma from "@/lib/prisma";
import AdminTestList from "./components/AdminTestList";

export default async function AdminTestPage() {
  const test = await prisma.placementTest.findFirst() || await prisma.placementTest.create({ data: { title: "Teste Principal" } });
  
  const questions = await prisma.question.findMany({ 
    where: { testId: test.id },
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
      <header className="mb-6 md:mb-10">
        <h1 className="flex items-center gap-2 text-3xl md:text-5xl font-bold font-frenchpress text-(--interface-accent) uppercase tracking-tighter">
          Gerenciar Teste
          <img src="/static/flower.svg" alt="Flor" className="w-8 h-8 object-contain pointer-events-none"/>
        </h1>
        <p className="text-slate-400 text-[10px] md:text-sm font-medium italic mt-1">
          Configure as perguntas do teste inicial.
        </p>
      </header>

      <AdminTestList initialQuestions={questions} testId={test.id} />
    </div>
  );
}