import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CoursePlayerPage from "./CoursePlayerPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const track = await prisma.track.findUnique({
    where: { 
      id: id 
    },
    include: {
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

  if (!track) {
    notFound();
  }

  return <CoursePlayerPage data={track} />;
}