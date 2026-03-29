"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveQuestion(data: {
  id?: string;
  text: string;
  options: string[];
  correctOption: number;
  levelAssigned: string;
  testId: string;
}) {
  try {
    if (data.id) {
      await prisma.question.update({
        where: { id: data.id },
        data: {
          text: data.text,
          options: data.options,
          correctOption: data.correctOption,
          levelAssigned: data.levelAssigned,
        },
      });
    } else {
      await prisma.question.create({
        data: {
          text: data.text,
          options: data.options,
          correctOption: data.correctOption,
          levelAssigned: data.levelAssigned,
          testId: data.testId,
        },
      });
    }

    revalidatePath("/admin/test");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar a pergunta." };
  }
}

export async function deleteQuestion(id: string) {
  try {
    await prisma.question.delete({ where: { id } });
    revalidatePath("/admin/test");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao eliminar." };
  }
}