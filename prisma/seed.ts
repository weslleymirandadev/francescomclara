import { PrismaClient, SubscriptionPlanType, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = "postgresql://admin:admin_password@localhost:5432/frances_com_clara?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🚀 Iniciando seed...");

  await prisma.siteSettings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      siteName: "Francês com Clara",
      siteNameFirstPart: "Francês com",
      siteNameHighlight: "Clara",
      highlightColor: "--clara-rose",
      instagramActive: true,
      instagramUrl: 'https://www.instagram.com/francescomclara/',
    },
  });

  const plansData: Prisma.SubscriptionPlanCreateInput[] = [
    {
      id: 'plano-pro',
      name: 'Plano Pro',
      description: 'Acesso total à plataforma com suporte e materiais.',
      monthlyPrice: 9700, 
      yearlyPrice: 89700,
      type: SubscriptionPlanType.INDIVIDUAL,
      active: true,
      features: ["Acesso a todas as trilhas", "Suporte da Clara", "Flashcards"],
    },
    {
      id: 'plano-familia',
      name: 'Plano Família',
      description: 'Aprenda francês com até 4 pessoas da sua família.',
      monthlyPrice: 0, 
      yearlyPrice: 149700,
      type: SubscriptionPlanType.FAMILY,
      active: true,
      features: ["Até 4 contas", "Suporte prioritário"],
    }
  ];

  const createdPlans = [];
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.create({
      data: p
    });
    createdPlans.push(plan);
  }

  const travelObj = await prisma.objective.upsert({
    where: { name: 'Viagem' },
    update: {},
    create: { 
      name: 'Viagem',
      imageUrl: "https://cdn.discordapp.com/attachments/1430318700837339281/1461787586359201924/henrique-ferreira-nuKDw3ywCSw-unsplash.jpg?ex=6971c207&is=69707087&hm=fcaf44a427e1633c7a18d97382be4b745e87ed3e288618598419b005d554f25e&" 
    }
  });

  const tracksData = [
    {
      id: 'trilha-viagem',
      name: 'Sobrevivência em Paris',
      description: 'Focado em situações reais de viagem.',
      objectiveId: travelObj.id,
      imageUrl: "https://media.discordapp.net/attachments/1430318700837339281/1461787583825575946/france-jobs-1.webp?ex=6971c206&is=69707086&hm=ea2dd0f4dc0495268c1720d9009b4fbbea0bd7d4055579366ec868f82d465905&=&format=webp&width=1110&height=724",
    }
  ];

  for (const t of tracksData) {
    const track = await prisma.track.upsert({
      where: { id: t.id },
      update: { active: true },
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        active: true,
        objective: { connect: { id: t.objectiveId } }
      }
    });

    for (const plan of createdPlans) {
    await prisma.subscriptionPlanTrack.create({
      data: {
        subscriptionPlanId: plan.id,
        trackId: track.id
      }
    });
  }
  }

  console.log('✅ Seed finalizado: Planos Pro (Mensal/Anual) e Família configurados!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });