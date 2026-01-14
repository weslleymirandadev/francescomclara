import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aulas - Francês com Clara",
  description: "Visualize, crie, edite e exclua os dados das aulas da plataforma Francês com Clara.",
};

export default function AdminAnalyticsLayout({
  children,
}: {
    children: React.ReactNode;
    }) {
    return (
    <div className="min-h-screen pb-2">
        {children}
    </div>
    );
}
