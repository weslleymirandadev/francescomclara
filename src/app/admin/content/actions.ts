"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CEFRLevel, SubscriptionPlan, Track } from "@prisma/client";

export async function updateObjectiveSettingsAction(
  id: string, 
  data: { icon?: string, iconRotate?: number }
) {
  await prisma.objective.update({
    where: { id },
    data: {
      ...(data.icon && { icon: data.icon }),
      ...(data.iconRotate !== undefined && { iconRotate: data.iconRotate }),
    }
  });
  revalidatePath("/admin/content");
}

export async function updateObjectiveNameAction(id: string, name: string) {
  if (!id || !name) return;

  await prisma.objective.update({
    where: { id },
    data: { name }
  });

  revalidatePath("/admin/content");
}

export async function updateTrackAction(id: string, data: { 
  name?: string; 
  description?: string; 
  imageUrl?: string; 
  active?: boolean;
}) {
  await prisma.track.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/content");
}

export async function updateTrackObjectiveAction(id: string, objectiveId: string) {
  await prisma.track.update({
    where: { id },
    data: { objectiveId }
  });
  revalidatePath("/admin/content");
}

export async function updateObjectiveImageAction(id: string, imageBase64: string) {
  await prisma.objective.update({
    where: { id },
    data: { imageUrl: imageBase64 }
  });
  revalidatePath("/admin/content");
}

export async function resetObjectiveImageAction(id: string) {
  await prisma.objective.update({
    where: { id },
    data: { imageUrl: "" }
  });
  revalidatePath("/admin/content");
}

export async function createObjectiveAction(name: string) {
  await prisma.objective.create({
    data: {
      name: name,
      imageUrl: ""
    }
  });
  revalidatePath("/admin/content");
}

export async function createTrackAction(objectiveId: string) {
  const plans = await prisma.subscriptionPlan.findMany({ where: { active: true } });

  await prisma.track.create({
    data: {
      name: "Nova Trilha",
      description: "Descrição da trilha",
      objectiveId: objectiveId,
      active: false,
      imageUrl: "",
      subscriptionPlans: {
        create: plans.map((plan: SubscriptionPlan) => ({
          subscriptionPlanId: plan.id
        }))
      }
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

export async function deleteObjectiveAction(id: string) {
  const tracks = await prisma.track.findMany({ where: { objectiveId: id } });
  
  const trackIds = tracks.map((t: Track) => t.id);
  
  if (trackIds.length > 0) {
    await prisma.subscriptionPlanTrack.deleteMany({
      where: { trackId: { in: trackIds } }
    });
    await prisma.track.deleteMany({ where: { objectiveId: id } });
  }

  await prisma.objective.delete({ where: { id } });
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

export async function toggleTrackAccessAction(trackId: string, planId: string) {
  const existing = await prisma.subscriptionPlanTrack.findUnique({
    where: { subscriptionPlanId_trackId: { subscriptionPlanId: planId, trackId: trackId } }
  });

  if (existing) {
    await prisma.subscriptionPlanTrack.delete({ where: { id: existing.id } });
  } else {
    await prisma.subscriptionPlanTrack.create({
      data: { subscriptionPlanId: planId, trackId: trackId }
    });
  }
  revalidatePath('/admin/content');
}

export async function toggleModulePremiumAction(id: string, currentStatus: boolean) {
  await prisma.module.update({
    where: { id },
    data: { isPremium: !currentStatus }
  });
  revalidatePath("/admin/content");
}

export async function toggleLessonPremiumAction(id: string, currentStatus: boolean) {
  await prisma.lesson.update({
    where: { id },
    data: { isPremium: !currentStatus }
  });
  revalidatePath("/admin/content");
}

export async function reorderObjectivesAction(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => 
      prisma.objective.update({
        where: { id },
        data: { order: index }
      })
    )
  );
  revalidatePath("/admin/content");
}