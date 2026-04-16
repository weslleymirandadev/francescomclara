import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "settings" },
    });

    const siteName = settings?.siteName || "Francês com Clara";

    return {
      title: `Fórum - ${siteName}`,
      description:
        "Participe de discussões e troque ideias com outros estudantes de francês no nosso fórum interativo.",
    };
  } catch (e) {
    return { title: "Fórum - Francês com Clara" };
  }
}

export default async function ForumLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      payments: {
        where: { status: { in: ["approved", "APPROVED"] } },
        include: { subscriptionPlan: true },
        take: 1,
      },
      parent: {
        include: {
          payments: {
            where: {
              status: { in: ["approved", "APPROVED"] },
              subscriptionPlan: { type: "FAMILY" },
            },
            include: { subscriptionPlan: true },
            take: 1,
          },
        },
      },
    },
  });

  const activePlan =
    user?.payments[0]?.subscriptionPlan ||
    user?.parent?.payments[0]?.subscriptionPlan;

  const features = (activePlan?.features as string[]) || [];
  const hasForumAccess = features.includes("forum_access");

  if (!activePlan || !hasForumAccess) {
    redirect("/assinar");
  }

  return <div className="min-h-screen bg-(--slate-50) md:px-6">{children}</div>;
}
