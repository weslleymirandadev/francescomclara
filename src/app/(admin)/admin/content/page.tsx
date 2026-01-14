import { prisma } from "@/lib/prisma";
import ContentList from "./ContentList";

export default async function Page() {
  const tracks = await prisma.track.findMany({
    orderBy: { 
      order: 'asc',
    },
    include: {
      objective: true,
      subscriptionPlans: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  const objectiveConfigs = await prisma.objective.findMany({
    orderBy: {
      order: 'asc'
    }
  });
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true }
  });

  return (
    <ContentList tracks={tracks} configs={objectiveConfigs} plans={plans} />
  );
}