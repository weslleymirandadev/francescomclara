"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(finalLevel: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Usuário não autenticado" };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email! },
      data: { 
        level: finalLevel,
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