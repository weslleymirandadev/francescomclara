"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";
import { useRouter } from "next/navigation";
import { BookOpen, Video, GraduationCap, CheckCircle2, Star, Clock } from "lucide-react";
import Image from "next/image";

type Lesson = {
  id: string;
  title: string;
  type: string;
  order: number;
};

type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type Track = {
  id: string;
  name: string;
  description: string;
  objective: 'TRAVEL' | 'WORK' | 'FAMILY' | 'KNOWLEDGE';
  imageUrl: string | null;
  active: boolean;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  discountPrice: number | null;
  discountEnabled: boolean;
  type: 'INDIVIDUAL' | 'FAMILY';
  period: 'MONTHLY' | 'YEARLY';
  features: any;
  tracks: Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
  }>;
  active: boolean;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [accessMap, setAccessMap] = useState<Record<string, { hasAccess: boolean }>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [greeting, setGreeting] = useState("");
  const [scrollY, setScrollY] = useState(0);

  const FR = (
    <Image
      src="/static/franca.png"
      alt="França"
      width={20}
      height={20}
      className="inline-block align-middle ml-1" 
    />
  );

  useEffect(() => {
    async function checkAccess() {
      if (session?.user?.id && tracks.length > 0) {
        const newAccessMap: Record<string, { hasAccess: boolean }> = {};

        await Promise.all(tracks.map(async (track) => {
          const itemKey = `track-${track.id}`;
          try {
            const response = await fetch(`/api/user/has-access?id=${track.id}`);
            const { hasAccess } = await response.json();
            newAccessMap[itemKey] = { hasAccess };
          } catch (error) {
            console.error("Error checking access for track:", track.id, error);
            newAccessMap[itemKey] = { hasAccess: false };
          }
        }));

        setAccessMap(prev => ({ ...prev, ...newAccessMap }));
      }
    }

    if (tracks.length > 0) {
      checkAccess();
    }
  }, [session, tracks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tracksRes, plansRes] = await Promise.all([
          fetch('/api/tracks?active=true'),
          fetch('/api/subscription-plans?active=true'),
        ]);

        if (!tracksRes.ok) throw new Error('Failed to fetch tracks');
        const tracksData = await tracksRes.json();
        setTracks(tracksData);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setSubscriptionPlans(plansData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const attemptPlay = () => {
      video.play().catch((error) => {
        console.log("Aguardando interação do usuário para rodar o vídeo...");
        
        const playOnInteraction = () => {
          video.play();
          window.removeEventListener("mousemove", playOnInteraction);
          window.removeEventListener("touchstart", playOnInteraction);
        };

        window.addEventListener("mousemove", playOnInteraction);
        window.addEventListener("touchstart", playOnInteraction);
      });
    };

    attemptPlay();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bonjour ! ☕");
    else if (hour >= 12 && hour < 18) setGreeting("Bon après-midi ! 🥖");
    else setGreeting("Bonsoir ! 🍷");
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, any> = {
      TRAVEL: <>{FR} Viagens</>,
      WORK: '💼 Trabalho',
      FAMILY: '🏠 Família',
      KNOWLEDGE: '🧠 Conhecimento',
    };
    return labels[objective] || objective;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'CLASS': return <Video className="w-4 h-4" />;
      case 'READING': return <BookOpen className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  const renderAccessButton = (track: Track) => {
    const itemId = `track-${track.id}`;
    const hasAccess = accessMap[itemId]?.hasAccess || false;

    if (session && hasAccess) {
      return (
        <Link
          href={`/dashboard/trilhas/${track.id}`}
          className="w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-sm"
        >
          Acessar Trilha
        </Link>
      );
    }

    return (
      <Link
        href={`/trilhas/${track.id}`}
        className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm"
      >
        Ver Detalhes
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-s-50)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clara-rose)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-s-50)]">
      {/* HERO BANNER - O Toque Francês */}
      <section className="relative h-[85vh] min-h-[650px] flex items-center overflow-hidden bg-[var(--color-s-900)]">
        <div className="absolute inset-0 z-0"
          style={{  transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <video
            ref={videoRef}
            key="hero-video"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate"
            loop
            muted
            playsInline
            autoPlay
            preload="auto"
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay para garantir que o texto seja legível */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-[var(--color-s-900)]/60 to-[var(--color-s-900)] z-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold mb-6 border border-white/20 text-blue-200">
              {greeting}
            </span>
            
            <span className="inline-flex items-center gap-2 px-4 py-1 mx-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6 border border-white/20 text-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Bienvenue à "Français avec Clara"{FR}
            </span>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white">
              Aprenda Francês com <span className="text-red-500">Elegância</span> e Fluidez.
            </h1>
            
            <p className="text-xl text-blue-50 mb-10 leading-relaxed max-w-2xl">
              Imersão cultural e aprendizado prático em um só lugar. 
              O seu caminho para a fluência começa aqui.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#trilhas" className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-xl">
                Explorar Trilhas
              </a>
              <a href="#planos" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                Ver Planos
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        
        {/* SEÇÃO DE TRILHAS - Layout Grid Profissional */}
        <section id="trilhas" className="mb-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-s-900)]">Trilhas de Aprendizado</h2>
              <p className="text-[var(--color-s-50)]0 mt-2">Programas completos estruturados por níveis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {tracks.map((track) => {
              const totalLessons = track.modules.reduce((sum, module) => sum + module.lessons.length, 0);
              return (
                <div key={track.id} className="group bg-white rounded-3xl border border-[var(--color-s-200)] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row">
                    {/* Lateral Esquerda - Info da Trilha */}
                    <div className="lg:w-1/3 p-8 bg-[var(--color-s-900)] text-white flex flex-col justify-between">
                      <div>
                        <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {getObjectiveLabel(track.objective)}
                        </span>
                        <h3 className="text-3xl font-bold mt-4 mb-4 leading-tight">{track.name}</h3>
                        <p className="text-[var(--color-s-400)] text-sm leading-relaxed mb-6">{track.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-[var(--color-s-300)]">
                            <Star className="w-4 h-4 text-yellow-500 mr-2" />
                            <span>Acesso Vitalício no Plano Pro</span>
                          </div>
                          <div className="flex items-center text-sm text-[var(--color-s-300)]">
                            <Clock className="w-4 h-4 text-blue-400 mr-2" />
                            <span>{totalLessons} lições práticas</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/10">
                        {renderAccessButton(track)}
                      </div>
                    </div>

                    {/* Conteúdo à Direita - Módulos e Lições Ampliadas */}
                    <div className="lg:w-2/3 p-8 bg-white card-france-gradient">
                      <h4 className="text-sm font-bold text-[var(--color-s-400)] uppercase tracking-widest mb-6">Conteúdo do Programa</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {track.modules.map((module) => (
                          <div key={module.id} className="p-5 rounded-2xl bg-[var(--color-s-50)] border border-[var(--color-s-100)] hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                {module.order}
                              </div>
                              <h5 className="font-bold text-[var(--color-s-800)]">{module.title}</h5>
                            </div>
                            
                            <ul className="space-y-3">
                              {module.lessons.map((lesson) => (
                                <li key={lesson.id} className="flex items-center text-sm text-[var(--color-s-600)] group/lesson">
                                  <span className="mr-2 text-[var(--color-s-300)] group-hover/lesson:text-blue-500 transition-colors">
                                    {getLessonIcon(lesson.type)}
                                  </span>
                                  {lesson.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEÇÃO DE PLANOS - Estilo Cartão de Crédito Premium */}
        <section id="planos" className="py-12 border-t border-[var(--color-s-200)]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[var(--color-s-900)] mb-4 tracking-tight">Assinaturas</h2>
            <p className="text-[var(--color-s-50)]0">Invista no seu futuro com planos que cabem no seu bolso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className="relative p-8 rounded-3xl bg-white border border-[var(--color-s-200)] shadow-sm hover:border-blue-500 transition-all group">
                {plan.period === 'YEARLY' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                    Melhor Valor
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-[var(--color-s-900)] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{formatPrice(plan.price / (plan.period === 'YEARLY' ? 12 : 1))}</span>
                  <span className="text-[var(--color-s-50)]0 text-sm font-medium">/mês</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-s-600)]">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                        if (status === "unauthenticated") {
                          // Redirecionar para login com callbackUrl
                          void signIn(undefined, { 
                            callbackUrl: `/assinar?planId=${plan.id}` 
                          });
                        } else {
                          // Se autenticado, redirecionar diretamente
                          router.push(`/assinar?planId=${plan.id}`);
                        }
                      }}
                  className="w-full py-4 rounded-xl font-bold bg-[var(--color-s-900)] text-white hover:bg-blue-800 transition-all shadow-md"
                >
                  Começar agora
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}