import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Planos - Francês com Clara",
  description: "Gerencie os planos da plataforma Francês com Clara."
};

export default function AdminSubscriptionLayout({
  children,
}: {
    children: React.ReactNode;
    }) {
    return (
    <div className="min-h-screen bg-[var(--color-s-50)] pb-12 px-6">
        {children}
    </div>
    );
  }