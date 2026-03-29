import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth"; // Adicione isso
import { authOptions } from "@/lib/auth"; // Verifique o caminho do seu authOptions
import CoursePlayerPage from "./CoursePlayerPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound(); // Ou redirecione para login
  }

  const track = await prisma.track.findUnique({
    where: { id: id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } }
        }
      }
    }
  });

  if (!track) {
    notFound();
  }

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      completed: true,
      lesson: {
        module: {
          trackId: id
        }
      }
    },
    select: {
      lessonId: true
    }
  });

  const completedLessons = progress.map((p: { lessonId: string }) => p.lessonId);

  const data = {
    ...track,
    completedLessons
  };

  return <CoursePlayerPage data={data} />;
}