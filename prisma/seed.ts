import { 
  PrismaClient, 
  LessonType, 
  SubscriptionPlanType, 
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = "postgresql://admin:admin_password@localhost:5432/frances_com_clara?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🚀 Iniciando seed...");

  // 1. Configurações do Site
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

  // 2. PLANOS (Lógica: Dois registros para o "Pro", um mensal e um anual com desconto)
  const plansData = [
    {
      id: 'plano-pro-mensal',
      name: 'Plano Pro',
      description: 'Acesso total flexível mês a mês.',
      price: 9700, // R$ 97,00
      type: SubscriptionPlanType.INDIVIDUAL,
      period: "MONTHLY",
      active: true,
      features: ["Acesso a todas as trilhas", "Suporte da Clara", "Flashcards"],
    },
    {
      id: 'plano-pro-anual',
      name: 'Plano Pro',
      description: 'O melhor custo-benefício para sua fluência.',
      price: 89700, // R$ 897,00 (sai R$ 74,75/mês)
      type: SubscriptionPlanType.INDIVIDUAL,
      period: "YEARLY",
      active: true,
      features: ["Tudo do Mensal", "Desconto de 2 meses", "Certificado de conclusão"],
    },
    {
      id: 'plano-familia-anual',
      name: 'Plano Família',
      description: 'Aprenda junto com quem você ama.',
      price: 149700, // R$ 1.497,00
      type: SubscriptionPlanType.FAMILY,
      period: "YEARLY",
      active: true,
      features: ["Até 4 contas separadas", "Suporte prioritário", "Relatórios de progresso"],
    }
  ];

  const plans = [];
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: { 
        name: p.name, 
        price: p.price, 
        active: true,
      },
      create: p as any,
    });
    plans.push(plan);
  }

  // 3. OBJETIVOS (Com suas imagens originais do Discord)
  const travelObj = await prisma.objective.upsert({
    where: { name: 'Viagem' },
    update: {},
    create: { 
      name: 'Viagem',
      imageUrl: "https://cdn.discordapp.com/attachments/1430318700837339281/1461787586359201924/henrique-ferreira-nuKDw3ywCSw-unsplash.jpg?ex=6971c207&is=69707087&hm=fcaf44a427e1633c7a18d97382be4b745e87ed3e288618598419b005d554f25e&" 
    }
  });

  // 4. TRILHAS
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

    // Vincula a trilha a todos os planos
    for (const plan of plans) {
      await prisma.subscriptionPlanTrack.upsert({
        where: {
          subscriptionPlanId_trackId: {
            subscriptionPlanId: plan.id,
            trackId: track.id
          }
        },
        update: {},
        create: {
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