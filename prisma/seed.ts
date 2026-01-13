import { 
  PrismaClient, 
  Objective, 
  LessonType, 
  SubscriptionPlanType, 
  SubscriptionPlanPeriod 
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = "postgresql://admin:admin_password@localhost:5432/frances_com_clara?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // 1. PLANOS DE ASSINATURA (Individuais e Família / Mensal e Anual)
  const plansData = [
    {
      id: 'plano-pro-mensal',
      name: 'Plano Pro Mensal',
      description: 'Acesso total flexível mês a mês.',
      price: 9700,
      type: SubscriptionPlanType.INDIVIDUAL,
      period: SubscriptionPlanPeriod.MONTHLY,
      features: ["Acesso a todas as trilhas", "Suporte da Clara", "Flashcards"],
    },
    {
      id: 'plano-pro-anual',
      name: 'Plano Pro Anual',
      description: 'O melhor custo-benefício para sua fluência.',
      price: 89700,
      type: SubscriptionPlanType.INDIVIDUAL,
      period: SubscriptionPlanPeriod.YEARLY,
      features: ["Tudo do Mensal", "Desconto de 2 meses", "Certificado de conclusão"],
    },
    {
      id: 'plano-familia',
      name: 'Plano Família Anual',
      description: 'Aprenda junto com quem você ama.',
      price: 149700,
      type: SubscriptionPlanType.FAMILY,
      period: SubscriptionPlanPeriod.YEARLY,
      features: ["Até 4 contas separadas", "Suporte prioritário", "Relatórios de progresso"],
    }
  ];

  const plans = [];
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, active: true },
    });
    plans.push(plan);
  }

  const travelObj = await prisma.objective.upsert({
    where: { name: 'TRAVEL' },
    update: {},
    create: { 
      name: 'TRAVEL',
      imageUrl: "https://exemplo.com/viagem.jpg" }
  });

  const workObj = await prisma.objective.upsert({
    where: { name: 'WORK' },
    update: {},
    create: { 
      name: 'WORK',
      imageUrl: "https://exemplo.com/work.jpg" }
  });

  const familyOBJ = await prisma.objective.upsert({
    where: { name: 'FAMILY' },
    update: {},
    create: { 
      name: 'FAMILY',
      imageUrl: "https://exemplo.com/family.jpg" }
  })

  const knowledgeOBJ = await prisma.objective.upsert({
    where: { name: 'KNOWLEDGE'},
    update: {},
    create: { 
      name: 'KNOWLEDGE',
      imageUrl: "https://exemplo.com/knowledge.jpg" }
  })

  const tracksData = [
    {
      id: 'trilha-viagem',
      name: 'Sobrevivência em Paris',
      description: 'Focado em situações reais de viagem: hotel, restaurante e passeios.',
      objective: travelObj.id,
      modules: [
        {
          title: 'No Aeroporto e Alfândega',
          order: 1,
          lessons: [
            { title: 'Vocabulário de Viagem', type: LessonType.CLASS, order: 1, content: { video: "url" } },
            { title: 'Prática de Diálogo', type: LessonType.STORY, order: 2, content: { text: "Simulação" } }
          ]
        }
      ]
    },
    {
      id: 'trilha-trabalho',
      name: 'Francês para Negócios',
      description: 'Aprenda a redigir e-mails e participar de reuniões em multinacionais.',
      objective: workObj.id,
      modules: [
        {
          title: 'E-mails e Comunicação',
          order: 1,
          lessons: [
            { title: 'Fórmulas de Cortesia', type: LessonType.READING, order: 1, content: { text: "Leia aqui" } },
            { title: 'Flashcards de Escritório', type: LessonType.FLASHCARD, order: 2, content: { cards: [] } }
          ]
        }
      ]
    },
    {
      id: 'trilha-familia',
      name: 'Conversação em Família',
      description: 'Ideal para quem tem parentes francófonos ou quer morar fora.',
      objective: familyOBJ.id,
      modules: [
        {
          title: 'Vida Cotidiana',
          order: 1,
          lessons: [
            { title: 'Cozinhando em Francês', type: LessonType.STORY, order: 1, content: { story: "Recette" } }
          ]
        }
      ]
    },
    {
      id: 'trilha-conhecimento',
      name: 'Cultura e Literatura',
      description: 'Para amantes da língua que desejam ler clássicos no original.',
      objective: knowledgeOBJ.id,
      modules: [
        {
          title: 'Grandes Autores',
          order: 1,
          lessons: [
            { title: 'Victor Hugo - Poemas', type: LessonType.READING, order: 1, content: { text: "Poésie" } }
          ]
        }
      ]
    }
  ];

  for (const t of tracksData) {
    const { modules, objective, ...trackInfo } = t;
    const track = await prisma.track.upsert({
    where: { id: t.id },
    update: {},
    create: {
      ...trackInfo,
      active: true,
      objective: {
        connect: { id: objective }
      },
      modules: {
        create: modules.map(m => ({
          title: m.title,
          order: m.order,
          lessons: {
            create: m.lessons.map(l => ({
              title: l.title,
              type: l.type,
              order: l.order,
              content: l.content as any
            }))
          }
        }))
      }
    }
  });

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

  // Criar SiteSettings se não existir
  await prisma.siteSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {},
  });

  console.log('✅ Banco de dados populado com todos os labels e objetivos!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });