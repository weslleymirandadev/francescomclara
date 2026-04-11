import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "profile" | "banner";

    if (!file || !type) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const MAX_SIZE = type === "banner" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Ficheiro demasiado grande para ${type}` },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const extension = file.type.split("/")[1];

    const filename = `${type}-${session.user.id}.${extension}`;
    const bucketName = "user-uploads";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filename);

    const updateData =
      type === "banner" ? { banner: publicUrl } : { image: publicUrl };

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Erro no upload:", error.message);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
