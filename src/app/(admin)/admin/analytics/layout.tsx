import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatórios - Francês com Clara",
  description: "Visualize e analise os dados da plataforma Francês com Clara.",
};

export default function AdminAnalyticsLayout({
  children,
}: {
    children: React.ReactNode;
    }) {
    return (
    <div className="min-h-screen pb-2 md:px-6">
        {children}
    </div>
    );
}
