import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LessonEditForm } from "./LessonEditForm";

interface PageProps {
  params: Promise<{ moduleId: string; id: string }>;
}

export default async function LessonEditPage({ params }: PageProps) {
  const { moduleId, id } = await params;

  // Busca os dados no servidor para garantir SEO e performance
  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
  });

  if (!lesson) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Passamos os dados para o formulário cliente */}
      <LessonEditForm initialData={lesson} moduleId={moduleId} />
    </div>
  );
}