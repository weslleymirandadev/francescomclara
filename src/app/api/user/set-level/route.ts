import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { level } = await req.json();

  await prisma.user.update({
    where: { email: session.user.email },
    data: { level: level }
  });

  return NextResponse.json({ success: true });
}