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
      title: `Flashcards - ${siteName}`,
      description:
        "Pratique e aprimore seu vocabulário em francês com nossos flashcards interativos e eficazes.",
    };
  } catch (e) {
    return { title: "Flashcards - Francês com Clara" };
  }
}

export default async function FlashcardsLayout({
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
  const hasFlashcardsAccess = features.includes("flashcards_access");

  if (!activePlan || !hasFlashcardsAccess) {
    redirect("/assinar");
  }

  return (
    <div className="min-h-screen bg-(--slate-50) px-3 md:px-6">{children}</div>
  );
}
