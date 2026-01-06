import { prisma } from "@/lib/prisma";
import ContentList from "./ContentList";

export default async function Page() {
  const tracks = await prisma.track.findMany({
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

  return <ContentList tracks={tracks} />;
}
