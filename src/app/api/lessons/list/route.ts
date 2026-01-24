import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc'
      }
    });
    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}