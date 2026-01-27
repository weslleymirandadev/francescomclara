"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { formatPrice } from "@/lib/price";
import { Crown, Check } from "lucide-react";
import { Loading } from "@/components/ui/loading"
import { SubscriptionPlanCard } from "@/components/SubscriptionPlanCard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  originalPrice?: number;
  discountPrice: number | null;
  discountEnabled: boolean;
  isBestValue: boolean;
  type: 'INDIVIDUAL' | 'FAMILY';
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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const planId = searchParams.get('planId') || 'default';
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkExistingSubscription() {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        
        if (data.subscription && !searchParams.get('upgrade')) {
          setUserData(data);
        }
      } catch (e) {
        console.error("Erro ao verificar assinatura");
      }
    }
    if (status === "authenticated") checkExistingSubscription();
  }, [status]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (!planId || planId === 'default') {
          const response = await fetch('/api/subscription-plans?active=true');
          const data = await response.json();
          setPlans(data);
          setPlan(null);
        } 
        else {
          const response = await fetch(`/api/subscription-plans/${planId}`);
          if (!response.ok) {
            window.history.replaceState(null, '', '/assinar');
            const resAll = await fetch('/api/subscription-plans?active=true');
            const dataAll = await resAll.json();
            setPlans(dataAll);
            return;
          }
          const data = await response.json();
          setPlan(data);
        }
      } catch (err) {
        setError('Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [planId]);

  useEffect(() => {
    if (status === "unauthenticated" && !authRedirecting) {
      setAuthRedirecting(true);
      void signIn(undefined, { callbackUrl: `/assinar?planId=${planId}` });
    }
  }, [status, planId, authRedirecting]);

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

  if (loading) return <Loading />;

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 animate-in fade-in duration-700">
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

  if (!plan) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 animate-in fade-in duration-700">
        <section id="planos" className="py-12 max-w-7xl mx-auto">

          {userData?.subscription && (
            <div className="mb-12 p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Você já possui um plano ativo</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{userData.subscription.name}</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">
                  Próxima renovação:{" "}
                  <span className="text-white">
                    {userData?.enrollments?.[0]?.endDate ? (
                      (() => {
                        const date = new Date(userData.enrollments[0].endDate);
                        return isNaN(date.getTime()) 
                          ? "Formato de data inválido" 
                          : date.toLocaleDateString('pt-BR');
                      })()
                    ) : (
                      "Data não disponível"
                    )}
                  </span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white bg-white/20 hover:bg-white/40 font-black uppercase text-[10px] tracking-widest px-8"
                    onClick={() => window.open('https://www.mercadopago.com.br/subscriptions', '_blank')}
                  >
                    Gerenciar Pagamento
                  </Button>
                </div>
              </div>
              {userData?.enrollments[0]?.createdAt && 
                (new Date().getTime() - new Date(userData.enrollments[0].createdAt).getTime()) / (1000 * 3600 * 24) < 7 && (
                  <Button 
                    variant="ghost" 
                    className="text-rose-400 hover:text-rose-300 font-black uppercase text-[10px] tracking-widest"
                    onClick={() => window.location.href = `mailto:suporte@seusite.com?subject=Reembolso: ${userData.subscription.name}`}
                  >
                    Solicitar Reembolso (Prazo de 7 dias)
                  </Button>
                )}
            </div>
          )}

          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-4xl font-black mb-4 tracking-tight bg-linear-to-r from-(--interface-accent) to-(--clara-rose) text-transparent bg-clip-text py-2">
              {userData?.subscription ? "Deseja mudar de plano?" : "Escolha o plano ideal para você"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p: any) => {
              const isCurrentPlan = userData?.subscription?.id === p.id || userData?.subscription?.name === p.name;
              
              return (
                <div key={p.id} className="relative">
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-2">
                      <Check size={12} strokeWidth={4} /> Seu Plano Atual
                    </div>
                  )}

                  <SubscriptionPlanCard
                    id={p.id}
                    name={p.name}
                    monthlyPrice={p.monthlyPrice || 0}
                    yearlyPrice={p.yearlyPrice || 0}
                    features={p.features}
                    isBestValue={p.type === 'FAMILY'}
                    buttonText={isCurrentPlan ? "Plano Ativo" : (userData?.subscription ? "Trocar Plano" : "Assinar Agora")}
                    disabled={isCurrentPlan}
                    className={isCurrentPlan ? "ring-4 ring-emerald-500/20 border-emerald-500" : ""}
                    onSubscribe={(id) => !isCurrentPlan && router.push(`/assinar?planId=${id}${userData?.subscription ? '' : ''}`)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  const basePrice = selectedPeriod === 'YEARLY' 
    ? (plan.yearlyPrice || 0)
    : (plan.monthlyPrice || 0);
  const total = plan.discountEnabled && plan.discountPrice ? plan.discountPrice : basePrice;
  
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
          <div className="flex gap-2 mt-4 mb-2">
            <button
              onClick={() => setSelectedPeriod('MONTHLY')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                selectedPeriod === 'MONTHLY'
                  ? 'bg-linear-to-r from-clara-rose to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-center">
                <div>Mensal</div>
                {plan.monthlyPrice && (
                  <div className="text-xs font-normal mt-1">
                    {formatPrice(plan.monthlyPrice || 0)}/mês
                  </div>
                )}
              </div>
            </button>
            <button
              onClick={() => setSelectedPeriod('YEARLY')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all relative ${
                selectedPeriod === 'YEARLY'
                  ? 'bg-linear-to-r from-clara-rose to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Anual</span>
                  {plan.yearlyPrice > 0 && plan.monthlyPrice > 0 && (
                    <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded">
                      Economia
                    </span>
                  )}
                </div>
                {plan.yearlyPrice > 0 && (
                  <div className="text-xs font-normal mt-1">
                    {formatPrice(Math.round(plan.yearlyPrice / 12))}/mês
                  </div>
                )}
              </div>
            </button>
          </div>
          <p className="text-xs text-black mt-1">
            O pagamento será cobrado agora e depois será cobrado automaticamente&nbsp;
            {selectedPeriod === 'YEARLY' ? (
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
              {selectedPeriod === 'YEARLY' ? 'Valor anual' : 'Valor mensal'}
            </span>
            <div className="text-right">
              {plan.discountEnabled && plan.originalPrice && (
                <span className="text-xs line-through text-gray-400 block mb-1">
                  {formatPrice(plan.originalPrice)}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(total)}
              </span>
              {selectedPeriod === 'YEARLY' && (
                <span className="text-xs text-gray-500 block mt-1">
                  {formatPrice(Math.round(total / 12))} por mês
                </span>
              )}
              {selectedPeriod === 'MONTHLY' && plan.yearlyPrice > 0 && (
                <span className="text-xs text-green-600 font-semibold block mt-1">
                  Economize {formatPrice((plan.monthlyPrice || 0) - Math.round(plan.yearlyPrice / 12))}/mês com o plano anual
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
            period={selectedPeriod}
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
