"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { formatPrice } from "@/lib/price";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // em centavos
  courses: Array<{
    id: string;
    title: string;
    price: number;
  }>;
}

function AssinarPageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get('planId') || 'default';

  // Buscar plano de assinatura
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/subscription-plans/${planId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Plano de assinatura não encontrado');
          } else {
            setError('Erro ao carregar plano de assinatura');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPlan(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar plano:', err);
        setError('Erro ao carregar plano de assinatura');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  // Se o usuário não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (status === "unauthenticated" && plan && !authRedirecting) {
      setAuthRedirecting(true);
      void signIn(undefined, { callbackUrl: `/assinar?planId=${planId}` });
    }
  }, [status, plan, planId, authRedirecting]);

  if (status === "loading" || authRedirecting || loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {loading ? "Carregando plano..." : "Redirecionando para login"}
          </h1>
          <p className="text-sm text-gray-500">
            Aguarde, estamos preparando sua assinatura.
          </p>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Erro ao carregar plano</h1>
          <p className="text-sm text-gray-500">
            {error || 'Plano de assinatura não encontrado'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    );
  }

  const total = plan.price;
  const items = plan.courses.map(course => ({
    id: course.id,
    type: 'course' as const,
    title: course.title,
    price: course.price
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8 rounded-lg bg-white p-6 shadow">
        <header className="space-y-1 border-b border-gray-200 pb-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Assinatura</p>
          <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {plan.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            O pagamento será cobrado automaticamente todo mês.
          </p>
        </header>

        <section className="space-y-4">
          <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Cursos incluídos no plano:</h2>
            <ul className="space-y-2">
              {plan.courses.length > 0 ? (
                plan.courses.map((course) => (
                  <li
                    key={course.id}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-700">{course.title}</span>
                    <span className="text-gray-500 text-xs">
                      Incluído
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">
                  Acesso a todos os cursos da plataforma
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-700">Valor mensal</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
        </section>

        <footer className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </Link>
          </div>

          <SubscriptionForm 
            amount={total} 
            items={items} 
          />
        </footer>
      </div>
    </main>
  );
}

export default function AssinarPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Carregando...</h1>
        </div>
      </main>
    }>
      <AssinarPageContent />
    </Suspense>
  );
}
