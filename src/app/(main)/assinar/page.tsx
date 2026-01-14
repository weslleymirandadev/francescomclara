"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { formatPrice } from "@/lib/price";
import { Crown, Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number; // em centavos
  originalPrice?: number;
  discountPrice: number | null;
  discountEnabled: boolean;
  type: 'INDIVIDUAL' | 'FAMILY';
  period: 'MONTHLY' | 'YEARLY';
  features: string[] | any;
  tracks?: Array<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  }>;
  active: boolean;
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
    if (status === "unauthenticated" && !authRedirecting) {
      setAuthRedirecting(true);
      // Redirecionar para login com callbackUrl preservando o planId
      void signIn(undefined, { callbackUrl: `/assinar?planId=${planId}` });
    }
  }, [status, planId, authRedirecting]);

  // Se não autenticado, mostrar loading enquanto redireciona
  if (status === "unauthenticated" || authRedirecting) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Redirecionando para login
          </h1>
          <p className="text-sm text-gray-500">
            Você precisa estar logado para assinar um plano.
          </p>
        </div>
      </main>
    );
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Carregando plano...
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

  const total = plan.discountEnabled && plan.discountPrice ? plan.discountPrice : plan.price;
  // Usar tracks se disponível, caso contrário usar courses (compatibilidade)
  const tracks = (plan.tracks as any) || [];
  const items = tracks.map((item: any) => ({
    id: item.id,
    type: 'course' as const,
    title: item.name || item.title,
    price: item.price || 0
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8 rounded-lg bg-white p-6 shadow">
        <header className="space-y-1 border-b border-gray-200 pb-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Assinatura</p>
          <h1 className="text-2xl p-2 rounded-lg inline-flex items-center justify-center font-semibold text-white bg-linear-to-r from-clara-rose to-pink-500">
            <Crown className="w-8 h-8 inline-block mr-2" />
            {plan.name}  
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {plan.description}
          </p>
          <p className="text-xs text-black mt-1">
            O pagamento será cobrado agora e depois será cobrado automaticamente&nbsp;
            {plan.period === 'YEARLY' ? (
              <>
                <span className="underline underline-offset-2 decoration-pink-500">anualmente</span>.
              </>
            ) : (
              <>
                <span className="underline underline-offset-2 decoration-pink-500">todo mês</span>.
              </>
            )}
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Vantagens incluídas no plano:</h2>
            <ul className="space-y-2">
              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                plan.features.map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <Check className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">
                  Nenhuma vantagem definida para este plano
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-700">
              {plan.period === 'YEARLY' ? 'Valor anual' : 'Valor mensal'}
            </span>
            <div className="text-right">
              {plan.discountEnabled && plan.originalPrice && (
                <span className="text-xs line-through text-white bg-linear-to-r from-clara-rose to-pink-500 p-2 rounded-md block">
                  {formatPrice(plan.originalPrice)}
                </span>
              )}
              <span className="text-lg font-semibold text-white bg-linear-to-r from-clara-rose to-pink-500 p-2 rounded-md">
                {formatPrice(total)}
              </span>
              {plan.period === 'YEARLY' && (
                <span className="text-xs text-gray-500 block">
                  {formatPrice(Math.round(total / 12))} por mês
                </span>
              )}
            </div>
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
            subscriptionPlanId={plan.id}
            period={plan.period}
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
