import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ModuleEditForm } from "./ModuleEditForm";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { moduleId } = await params;

  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { 
      lessons: {
        orderBy: {
          order: 'asc',
        },
      } ,
      track: true
    }
  });

  if (!moduleData) {
    notFound();
  }

  return <ModuleEditForm initialData={moduleData} />;
}