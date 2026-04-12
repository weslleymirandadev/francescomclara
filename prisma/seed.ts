import {
  PrismaClient,
  SubscriptionPlanType,
  Prisma,
  LessonType,
  CEFRLevel,
} from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
      instagramUrl: "https://www.instagram.com/francescomclara/",
    },
  });

  // 2. Planos de Assinatura
  const plansData = [
    {
      id: "plano-pro",
      name: "Plano Pro",
      description: "Acesso total à plataforma com suporte e materiais.",
      monthlyPrice: 9700,
      yearlyPrice: 89700,
      type: SubscriptionPlanType.INDIVIDUAL,
      active: true,
      features: ["Acesso a todas as trilhas", "Suporte da Clara", "Flashcards"],
    },
    {
      id: "plano-familia",
      name: "Plano Família",
      description: "Aprenda francês com até 4 pessoas da sua família.",
      monthlyPrice: 14700,
      yearlyPrice: 139700,
      type: SubscriptionPlanType.FAMILY,
      active: true,
      features: ["Até 4 contas", "Suporte prioritário"],
    },
  ];

  const createdPlans = [];
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    createdPlans.push(plan);
  }

  // 3. Objetivo
  const travelObj = await prisma.objective.upsert({
    where: { name: "Viagem" },
    update: {
      icon: "ph:airplane-tilt-fill",
      color: "#E11D48",
    },
    create: {
      name: "Viagem",
      icon: "ph:airplane-tilt-fill",
      color: "#E11D48",
      imageUrl:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000",
    },
  });

  const careerObj = await prisma.objective.upsert({
    where: { name: "Carreira" },
    update: {},
    create: {
      name: "Carreira",
      icon: "ph:briefcase-fill",
      color: "#2563EB",
      imageUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000",
    },
  });

  const cultureObj = await prisma.objective.upsert({
    where: { name: "Cultura" },
    update: {},
    create: {
      name: "Cultura",
      icon: "ph:paint-brush-broad-fill",
      color: "#8B5CF6",
      imageUrl:
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000",
    },
  });

  // 4. Trilhas, Módulos e Lições
  const tracksToCreate = [
    {
      id: "trilha-paris",
      name: "Sobrevivência em Paris",
      description:
        "O essencial para se comunicar em aeroportos, hotéis e ruas.",
      objectiveId: travelObj.id,
      imageUrl:
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000",
      modules: [
        {
          title: "Primeiros Passos na França",
          lessons: [
            {
              title: "No Controle de Passaportes",
              type: LessonType.CLASS,
              isPremium: false,
            },
            {
              title: "Check-in no Hotel",
              type: LessonType.STORY,
              isPremium: true,
            },
          ],
        },
      ],
    },
    {
      id: "trilha-business",
      name: "Francês Corporativo",
      description:
        "Termos técnicos e etiqueta para reuniões e e-mails profissionais.",
      objectiveId: careerObj.id,
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000",
      modules: [
        {
          title: "Comunicação Profissional",
          lessons: [
            {
              title: "Apresentação Pessoal",
              type: LessonType.CLASS,
              isPremium: false,
            },
            {
              title: "Vocabulário de Negócios",
              type: LessonType.CLASS,
              isPremium: true,
            },
          ],
        },
      ],
    },
    {
      id: "trilha-gastronomia",
      name: "O Mundo do Vinho e Queijo",
      description:
        "Explore a cultura gastronômica francesa e aprenda a degustar.",
      objectiveId: cultureObj.id,
      imageUrl:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000",
      modules: [
        {
          title: "Introdução à Enologia",
          lessons: [
            {
              title: "Tipos de Uvas",
              type: LessonType.CLASS,
              isPremium: false,
            },
            {
              title: "Harmonização Básica",
              type: LessonType.STORY,
              isPremium: true,
            },
          ],
        },
      ],
    },
  ];

  for (const t of tracksToCreate) {
    const track = await prisma.track.upsert({
      where: { id: t.id },
      update: { active: true },
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        active: true,
        objectiveId: t.objectiveId,
        modules: {
          create: t.modules.map((m, mIdx) => ({
            title: m.title,
            order: mIdx + 1,
            cefrLevel: CEFRLevel.A1,
            lessons: {
              create: m.lessons.map((l, lIdx) => ({
                title: l.title,
                type: l.type,
                order: lIdx + 1,
                content: {},
                isPremium: l.isPremium,
              })),
            },
          })),
        },
      },
    });

    // VINCULAR AOS PLANOS (PRO e FAMÍLIA)
    for (const plan of createdPlans) {
      await prisma.subscriptionPlanTrack.upsert({
        where: {
          subscriptionPlanId_trackId: {
            subscriptionPlanId: plan.id,
            trackId: track.id,
          },
        },
        update: {},
        create: { subscriptionPlanId: plan.id, trackId: track.id },
      });
    }
  }

  // 5. Adicionar lição de exemplo com sentences interativas
  console.log("📝 Criando lição com sentences...");
  
  // Buscar o primeiro módulo disponível
  const firstModule = await prisma.module.findFirst({
    orderBy: { order: 'asc' }
  });

  if (firstModule) {
    const sentencesLesson = await prisma.lesson.upsert({
      where: { id: "lesson-sentences-exemplo" },
      update: {
        title: "Saudações e Apresentações Interativas",
        type: LessonType.READING,
        content: {
          sentences: [
            {
              frase: "Bonjour à tous!",
              traducao: "Bom dia a todos!",
              explicacao: "O 'à' aqui indica direção/destino. 'Tous' é usado para o plural geral."
            },
            {
              frase: "Comment ça va?",
              traducao: "Como vai?",
              explicacao: "Expressão informal. O 'ça' é um pronome demonstrativo neutro."
            },
            {
              frase: "Je m'appelle Marie.",
              traducao: "Eu me chamo Marie.",
              explicacao: "O verbo 's'appeler' é reflexivo, por isso usa 'me' antes do verbo."
            },
            {
              frase: "J'habite à Paris.",
              traducao: "Eu moro em Paris.",
              explicacao: "O 'J'' é a contração de 'Je' antes de vogal. 'À Paris' indica localização."
            },
            {
              frase: "Quelle heure est-il?",
              traducao: "Que horas são?",
              explicacao: "Formal para perguntar as horas. 'Il' refere-se ao tempo."
            }
          ]
        },
        order: 999,
        isPremium: false,
      },
      create: {
        id: "lesson-sentences-exemplo",
        title: "Saudações e Apresentações Interativas",
        type: LessonType.READING,
        content: {
          sentences: [
            {
              frase: "Bonjour à tous!",
              traducao: "Bom dia a todos!",
              explicacao: "O 'à' aqui indica direção/destino. 'Tous' é usado para o plural geral."
            },
            {
              frase: "Comment ça va?",
              traducao: "Como vai?",
              explicacao: "Expressão informal. O 'ça' é um pronome demonstrativo neutro."
            },
            {
              frase: "Je m'appelle Marie.",
              traducao: "Eu me chamo Marie.",
              explicacao: "O verbo 's'appeler' é reflexivo, por isso usa 'me' antes do verbo."
            },
            {
              frase: "J'habite à Paris.",
              traducao: "Eu moro em Paris.",
              explicacao: "O 'J'' é a contração de 'Je' antes de vogal. 'À Paris' indica localização."
            },
            {
              frase: "Quelle heure est-il?",
              traducao: "Que horas são?",
              explicacao: "Formal para perguntar as horas. 'Il' refere-se ao tempo."
            }
          ]
        },
        order: 999,
        isPremium: false,
        moduleId: firstModule.id,
      },
    });

    console.log(`✅ Lição com sentences criada: ${sentencesLesson.title}`);
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
