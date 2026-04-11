import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, exerciseIndex, userAnswer, correctAnswer, isCorrect, exerciseType } = await req.json();

    // Salvar ou atualizar a resposta do exercício
    const answer = await prisma.exerciseAnswer.upsert({
      where: {
        userId_lessonId_exerciseIndex_exerciseType: {
          userId: session.user.id,
          lessonId,
          exerciseIndex,
          exerciseType,
        },
      },
      update: {
        userAnswer,
        correctAnswer,
        isCorrect,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId,
        exerciseIndex,
        userAnswer,
        correctAnswer,
        isCorrect,
        exerciseType,
      },
    });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Error saving exercise answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const exerciseType = searchParams.get("exerciseType");

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const answers = await prisma.exerciseAnswer.findMany({
      where: {
        userId: session.user.id,
        lessonId,
        ...(exerciseType && { exerciseType }),
      },
      orderBy: {
        exerciseIndex: "asc",
      },
    });

    return NextResponse.json({ answers });
  } catch (error) {
    console.error("Error fetching exercise answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const exerciseType = searchParams.get("exerciseType");

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const result = await prisma.exerciseAnswer.deleteMany({
      where: {
        userId: session.user.id,
        lessonId,
        ...(exerciseType && { exerciseType }),
      },
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (error) {
    console.error("Error deleting exercise answers:", error);
    return NextResponse.json({ error: "Failed to delete answers" }, { status: 500 });
  }
}
