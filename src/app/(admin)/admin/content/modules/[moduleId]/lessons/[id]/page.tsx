import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LessonEditForm } from "./LessonEditForm";

interface PageProps {
  params: Promise<{ moduleId: string; id: string }>;
}

export default async function LessonEditPage({ params }: PageProps) {
  const { moduleId, id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
  });

  if (!lesson) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <LessonEditForm initialData={lesson} moduleId={moduleId} />
    </div>
  );
}