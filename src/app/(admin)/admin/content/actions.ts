"use server"

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CEFRLevel, SubscriptionPlan, Track, LessonType } from "@prisma/client";

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

export async function updateTrackAction(
  id: string, 
  data: { 
    name?: string; 
    description?: string; 
    active?: boolean; 
    objectiveId?: string;
  }
) {
  return await prisma.track.update({
    where: { id },
    data: data
  });
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

export async function updateModuleAction(
  id: string, 
  data: { title?: string; cefrLevel?: CEFRLevel; isPremium?: boolean }
) {
  await prisma.module.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.cefrLevel && { cefrLevel: data.cefrLevel }),
      ...(data.isPremium !== undefined && { isPremium: data.isPremium }),
    }
  });
  revalidatePath("/admin/content");
}

export async function updateLessonTitleAction(id: string, title: string) {
  await prisma.lesson.update({
    where: { id },
    data: { title },
  });
  revalidatePath("/admin/content");
}

export async function updateLessonTypeAction(id: string, type: LessonType) {
  await prisma.lesson.update({
    where: { id },
    data: { type }
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
 const newObjective = await prisma.objective.create({
    data: {
      name: name,
      imageUrl: ""
    }
  });
  revalidatePath("/admin/content");
  return newObjective;
}

export async function createTrackAction(objectiveId: string) {
  const plans = await prisma.subscriptionPlan.findMany({ where: { active: true } });

  const newTrack = await prisma.track.create({
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
  return newTrack;
}

export async function createModuleAction(trackId: string) {
  const lastModule = await prisma.module.findFirst({
    where: { trackId },
    orderBy: { order: 'asc' }
  });
  const nextOrder = lastModule ? lastModule.order + 1 : 0;

  const newModule = await prisma.module.create({
    data: {
      title: "Novo Módulo",
      trackId,
      order: nextOrder,
      cefrLevel: CEFRLevel.A1
    }
  });
  revalidatePath("/admin/content");
  return newModule;
}

export async function createLessonAction(moduleId: string) {
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'asc' }
  });
  const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

  const newLesson = await prisma.lesson.create({
    data: {
      title: "Nova Aula",
      type: "CLASS",
      moduleId,
      order: nextOrder,
      content: {}
    }
  });
  revalidatePath("/admin/content");
  return newLesson;
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
  await prisma.track.deleteMany({
    where: { id }
  });
  revalidatePath("/admin/content");
}

export async function deleteModuleAction(id: string) {
  await prisma.module.deleteMany({ where: { id } });
  revalidatePath("/admin/content");
}

export async function deleteLessonAction(id: string) {
  await prisma.lesson.deleteMany({ where: { id } });
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

export async function reorderLessonsAction(lessonIds: string[]) {
  const updates = lessonIds.map((id, index) => 
    prisma.lesson.update({
      where: { id },
      data: { order: index }
    })
  );

  await prisma.$transaction(updates);
  revalidatePath("/admin/content");
}

export async function saveContentBulkAction(
  localTracks: any[], 
  itemsToDelete: any, 
  localObjectives: any[]
) {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // 1. DELEÇÕES
      if (itemsToDelete.lessons?.length > 0) {
        await tx.lesson.deleteMany({ where: { id: { in: itemsToDelete.lessons } } });
      }
      if (itemsToDelete.modules?.length > 0) {
        await tx.module.deleteMany({ where: { id: { in: itemsToDelete.modules } } });
      }
      if (itemsToDelete.tracks?.length > 0) {
        const realTrackIds = itemsToDelete.tracks.filter((id: string) => !id.startsWith('temp-'));
        if (realTrackIds.length > 0) {
          await tx.track.deleteMany({ where: { id: { in: realTrackIds } } });
        }
      }
      if (itemsToDelete.objectives?.length > 0) {
        const realObjIds = itemsToDelete.objectives.filter((id: string) => !id.startsWith('temp-'));
        if (realObjIds.length > 0) {
          await tx.objective.deleteMany({ where: { id: { in: realObjIds } } });
        }
      }

      // 2. SINCRONIZAR OBJETIVOS
      for (const [objIndex, obj] of localObjectives.entries()) {
        const isTempObj = obj.id.startsWith('temp-');
        await tx.objective.upsert({
          where: { id: isTempObj ? '0000-0000' : obj.id },
          create: {
            name: obj.name,
            icon: obj.icon || "lucide:target",
            order: objIndex,
          },
          update: {
            name: obj.name,
            order: objIndex,
          }
        });
      }

      // 3. SINCRONIZAR TRILHAS
      for (const [tIndex, track] of localTracks.entries()) {
        const isTempTrack = track.id.startsWith('temp-');
        const savedTrack = await tx.track.upsert({
          where: { id: isTempTrack ? '0000-0001' : track.id },
          create: {
            name: track.name,
            description: track.description || "",
            objectiveId: track.objectiveId,
            order: tIndex,
            active: track.active ?? true,
          },
          update: {
            name: track.name,
            description: track.description,
            active: track.active,
            order: tIndex,
            objectiveId: track.objectiveId,
          }
        });

        // 4. SINCRONIZAR MÓDULOS
        if (track.modules) {
          for (const [mIndex, mod] of track.modules.entries()) {
            const isTempMod = mod.id.startsWith('temp-');
            const savedMod = await tx.module.upsert({
              where: { id: isTempMod ? '0000-0002' : mod.id },
              create: {
                title: mod.title || "Novo Módulo",
                trackId: savedTrack.id,
                isPremium: mod.isPremium || false,
                order: mIndex,
              },
              update: {
                title: mod.title,
                isPremium: mod.isPremium,
                order: mIndex,
              }
            });

            // 5. SINCRONIZAR AULAS
            if (mod.lessons) {
              for (const [lIndex, lesson] of mod.lessons.entries()) {
                const isTempLesson = lesson.id.startsWith('temp-');
                await tx.lesson.upsert({
                  where: { id: isTempLesson ? '0000-0003' : lesson.id },
                  create: {
                    title: lesson.title || "Nova Aula",
                    moduleId: savedMod.id,
                    isPremium: lesson.isPremium || false,
                    order: lIndex,
                    type: LessonType.CLASS,
                    content: "", 
                  },
                  update: {
                    title: lesson.title,
                    isPremium: lesson.isPremium,
                    order: lIndex,
                  }
                });
              }
            }
          }
        }
      }

      revalidatePath("/admin/content");
      return { success: true };
    });
  } catch (error) {
    console.error("Erro crítico no salvamento:", error);
    return { success: false, error: "Falha ao sincronizar com o banco de dados." };
  }
}