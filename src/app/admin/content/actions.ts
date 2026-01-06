"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TrackObjective, CEFRLevel } from "@prisma/client";

export async function createTrackAction() { 
  await prisma.track.create({
    data: {
      name: "Nova Trilha",
      description: "Descrição da trilha",
      objective: TrackObjective.TRAVEL,
      active: true,
      imageUrl: "",
    }
  });
  revalidatePath("/admin/content");
}

export async function createModuleAction(trackId: string) {
  const lastModule = await prisma.module.findFirst({
    where: { trackId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = lastModule ? lastModule.order + 1 : 0;

  await prisma.module.create({
    data: {
      title: "Novo Módulo",
      trackId,
      order: nextOrder,
      cefrLevel: CEFRLevel.A1
    }
  });
  revalidatePath("/admin/content");
}

export async function createLessonAction(moduleId: string) {
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

  await prisma.lesson.create({
    data: {
      title: "Nova Aula",
      type: "CLASS",
      moduleId,
      order: nextOrder,
      content: {}
    }
  });
  revalidatePath("/admin/content");
}

export async function deleteTrackAction(id: string) {
  await prisma.track.delete({ where: { id } });
  revalidatePath("/admin/content");
}

export async function deleteModuleAction(id: string) {
  await prisma.module.delete({ where: { id } });
  revalidatePath("/admin/content");
}

export async function deleteLessonAction(id: string) {
  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/admin/content");
}