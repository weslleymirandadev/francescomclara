import { prisma } from "@/lib/prisma";
import ContentList from "./ContentList";

export default async function Page() {
  const tracks = await prisma.track.findMany({
    orderBy: { 
      createdAt: 'desc' 
    },
    include: {
      subscriptionPlans: true,
      modules: {
        orderBy: { 
          createdAt: 'desc' 
        },
        include: {
          lessons: {
            orderBy: { 
              createdAt: 'desc' 
            }
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
    <div className="min-h-screen bg-s-50/50 pb-20">
      <ContentList tracks={tracks} configs={objectiveConfigs} plans={plans} />
    </div>
  );
}