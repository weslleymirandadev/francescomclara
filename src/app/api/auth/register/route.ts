import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dados insuficientes" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { 
        name, 
        email,
        passwords: {
          create: {
            hash: hashedPassword
          }
        }
      }
    });

    return NextResponse.json({ message: "Usuário criado!" }, { status: 201 });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}