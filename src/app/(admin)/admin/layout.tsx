import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './_components/admin-sidebar';
import { authOptions } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header'
import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "settings" }
  });

  const siteName = settings?.siteName || "Francês com Clara";
  const description = settings?.seoDescription || "Aprenda francês de forma prática e cultural com a Clara.";

  return {
    title: `Administração - ${siteName}`,
    description: description,
  }
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-[calc(100dvh-60px)] bg-third">
      <Header />
      <div className='mt-12 flex flex-1'>
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">
          <main className="pt-8 px-3 md:p-8">
            {children}
            <Toaster />
          </main>
        </div>
      </div>
    </div>
  );
}
