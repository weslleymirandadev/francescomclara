import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        enrollments: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const formattedStudents = students.map((student: any) => ({
      id: student.id,
      name: student.name || "Aluno sem nome",
      planType: student.enrollments?.[0]?.planId || "Nenhum",
      createdAt: student.createdAt
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar alunos" }, { status: 500 });
  }
}