import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [tracks, plans] = await Promise.all([
      prisma.track.findMany({
        where: { active: true },
        include: {
          objective: true,
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: { orderBy: { order: 'asc' } }
            }
          }
        }
      }),
      prisma.subscriptionPlan.findMany({
        where: { active: true },
        include: {
          tracks: {
            include: {
              track: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: [
          { type: 'asc' },
          { monthlyPrice: 'asc' },
        ],
      })
    ]);

    const sortedTracks = tracks.sort((a: any, b: any) => {
      const orderA = a.objective?.order ?? 0;
      const orderB = b.objective?.order ?? 0;
      return orderA - orderB;
    });

    const formattedPlans = plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      discountPrice: plan.discountPrice,
      discountEnabled: plan.discountEnabled,
      isBestValue: plan.isBestValue,
      type: plan.type,
      features: plan.features,
      tracks: plan.tracks
        .filter((spt: any) => spt.track)
        .map((spt: any) => ({
          id: spt.track!.id,
          name: spt.track!.name,
          description: spt.track!.description,
          imageUrl: spt.track!.imageUrl,
        })),
      active: plan.active,
    }));

    return NextResponse.json({ 
      tracks: sortedTracks,
      plans: formattedPlans 
    });
  } catch (error) {
    console.error("Erro na API de conteúdo unificado:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conteúdo" }, 
      { status: 500 }
    );
  }
}