import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação - Frances Com Clara",
  description: "Faça login ou registre-se em Frances Com Clara",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}
