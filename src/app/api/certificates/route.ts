import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserFeatures } from "@/lib/subscription";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const userFeatures = await getUserFeatures(userId);

    if (!userFeatures.hasCertificate) {
      return NextResponse.json({ error: "Certificados não disponíveis no seu plano" }, { status: 403 });
    }

    // Buscar todas as trilhas concluídas pelo usuário
    const completedTracks = await prisma.track.findMany({
      where: {
        modules: {
          every: {
            lessons: {
              some: {
                progress: {
                  some: {
                    userId: userId,
                    completed: true
                  }
                }
              }
            }
          }
        }
      },
      include: {
        objective: {
          select: {
            name: true
          }
        },
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: {
                    userId: userId
                  }
                }
              }
            }
          }
        }
      }
    });

    const certificates = [];

    for (const track of completedTracks) {
      // Verificar se todas as lições da trilha foram concluídas
      const totalLessons = track.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
      const completedLessons = track.modules.reduce((acc: number, module: any) => 
        acc + module.lessons.filter((lesson: any) => 
          lesson.progress.some((progress: any) => progress.completed)
        ).length, 0
      );

      if (completedLessons === totalLessons && totalLessons > 0) {
        // Verificar se certificado já existe
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            userId: userId,
            trackId: track.id
          }
        });

        if (!existingCertificate) {
          // Criar novo certificado
          const certificate = await prisma.certificate.create({
            data: {
              userId: userId,
              trackId: track.id,
              certificateCode: generateCertificateCode(userId, track.id),
              issuedAt: new Date(),
              completionDate: new Date(),
            }
          });

          certificates.push({
            id: certificate.id,
            trackName: track.name,
            objectiveName: track.objective.name,
            certificateCode: certificate.certificateCode,
            issuedAt: certificate.issuedAt,
            completionDate: certificate.completionDate,
            totalLessons,
            isNew: true
          });
        } else {
          certificates.push({
            id: existingCertificate.id,
            trackName: track.name,
            objectiveName: track.objective.name,
            certificateCode: existingCertificate.certificateCode,
            issuedAt: existingCertificate.issuedAt,
            completionDate: existingCertificate.completionDate,
            totalLessons,
            isNew: false
          });
        }
      }
    }

    return NextResponse.json({
      certificates,
      hasFeature: userFeatures.hasCertificate,
      totalCertificates: certificates.length
    });

  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return NextResponse.json({ error: "Erro ao buscar certificados" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { trackId } = body;

    if (!trackId) {
      return NextResponse.json({ error: "ID da trilha é obrigatório" }, { status: 400 });
    }

    const userId = session.user.id;
    const userFeatures = await getUserFeatures(userId);

    if (!userFeatures.hasCertificate) {
      return NextResponse.json({ error: "Certificados não disponíveis no seu plano" }, { status: 403 });
    }

    // Verificar se trilha existe e foi concluída
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: {
                    userId: userId
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!track) {
      return NextResponse.json({ error: "Trilha não encontrada" }, { status: 404 });
    }

    // Verificar conclusão
    const totalLessons = track.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
    const completedLessons = track.modules.reduce((acc: number, module: any) => 
      acc + module.lessons.filter((lesson: any) => 
        lesson.progress.some((progress: any) => progress.completed)
      ).length, 0
    );

    if (completedLessons !== totalLessons) {
      return NextResponse.json({ error: "Trilha não foi concluída completamente" }, { status: 400 });
    }

    // Verificar se certificado já existe
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: userId,
        trackId: trackId
      }
    });

    if (existingCertificate) {
      return NextResponse.json({
        certificate: existingCertificate,
        message: "Certificado já existe"
      });
    }

    // Criar certificado
    const certificate = await prisma.certificate.create({
      data: {
        userId: userId,
        trackId: trackId,
        certificateCode: generateCertificateCode(userId, trackId),
        issuedAt: new Date(),
        completionDate: new Date(),
      }
    });

    return NextResponse.json({
      certificate,
      message: "Certificado gerado com sucesso!"
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    return NextResponse.json({ error: "Erro ao gerar certificado" }, { status: 500 });
  }
}

function generateCertificateCode(userId: string, trackId: string): string {
  const timestamp = Date.now().toString(36);
  const userHash = userId.slice(-6).toUpperCase();
  const trackHash = trackId.slice(-6).toUpperCase();
  return `CERT-${userHash}-${trackHash}-${timestamp}`;
}
