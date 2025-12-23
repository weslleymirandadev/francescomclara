import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './_components/admin-sidebar';
import { authOptions } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';

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
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
