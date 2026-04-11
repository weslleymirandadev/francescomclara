"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CEFRLevel } from "@prisma/client";

export async function completeOnboarding(finalLevel: CEFRLevel) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Usuário não autenticado" };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email! },
      data: { 
        level: finalLevel as CEFRLevel,
        onboarded: true 
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar nivelamento:", error);
    return { error: "Falha ao salvar seu nível." };
  }
}