import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "profile" | "banner";

    if (!file || !type) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

    const MAX_SIZE = type === "banner" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Ficheiro demasiado grande para ${type}` }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Formato não suportado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.type.split("/")[1];
    const filename = `${type}-${session.user.id || Date.now()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/${filename}`;

    await prisma.user.update({
      where: { email: session.user.email },
      data: type === "profile" ? { image: fileUrl } : { bannerUrl: fileUrl },
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}