"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";
import { 
  BookOpen, Video, GraduationCap, Clock, Layers, BookText, 
  Lock, Sparkles, Play, CheckCircle2, Crown, CheckCircle2 as CheckCircle
} from "lucide-react";
import { SubscriptionPlanCard } from "@/components/SubscriptionPlanCard";
import Image from "next/image";
import { Icon } from '@iconify/react';
import { getGlobalData } from "./actions/settings";
import { Loading } from   '@/components/ui/loading'

// Tipos para usuários logados (Duolingo)
type Lesson = {
  id: string;
  title: string;
  type: string;
  order: number;
  isPremium?: boolean;
};

type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  isLocked?: boolean;
  isPremium?: boolean;
};

type Track = {
  id: string;
  name: string;
  description: string;
  objective: {
    id: string;
    name: string;
    icon: string;
    iconRotate: number;
    order: number;
    color: string;
    imageUrl?: string;
  };
  imageUrl: string | null;
  active: boolean;
  modules: Module[];
  isLocked?: boolean;
  hasAccess?: boolean;
  freeLessonsCount?: number;
  totalLessonsCount?: number;
};

type StudyContent = {
  tracks: Track[];
  hasActiveSubscription: boolean;
  completedLessonIds: string[];
};

// Tipos para landing page (usuários deslogados)
type LandingLesson = {
  id: string;
  title: string;
  type: string;
  order: number;
};

type LandingModule = {
  id: string;
  title: string;
  order: number;
  lessons: LandingLesson[];
};

type LandingTrack = {
  id: string;
  name: string;
  description: string;
  objective: {
    id: string;
    name: string;
    icon: string;
    iconRotate: number;
    order: number;
    color: string;
    imageUrl?: string;
  };
  imageUrl: string | null;
  active: boolean;
  modules: LandingModule[];
  createdAt: string;
  updatedAt: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  price?: number; // Compatibilidade
  originalPrice?: number;
  discountPrice: number | null;
  discountEnabled: boolean;
  isBestValue: boolean;
  type: 'INDIVIDUAL' | 'FAMILY';
  period?: 'MONTHLY' | 'YEARLY'; // Compatibilidade
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
  const router = useRouter();
  
  // Estados para usuários logados (Duolingo)
  const [studyContent, setStudyContent] = useState<StudyContent | null>(null);
  const [loadingStudy, setLoadingStudy] = useState(true);
  
  // Estados para landing page (usuários deslogados)
  const [tracks, setTracks] = useState<LandingTrack[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingLanding, setLoadingLanding] = useState(true);
  const [accessMap, setAccessMap] = useState<Record<string, { hasAccess: boolean }>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [greeting, setGreeting] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

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
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bonjour ! ☕");
    else if (hour >= 12 && hour < 18) setGreeting("Bon après-midi ! 🥖");
    else setGreeting("Bonsoir ! 🍷");
  }, []);

  // Lógica para usuários logados (Duolingo)
  useEffect(() => {
    async function fetchStudyContent() {
      if (status === "loading") return;
      
      if (!session?.user) {
        setLoadingStudy(false);
        return;
      }

      try {
        const response = await fetch("/api/user/study-content");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStudyContent(data);
      } catch (error) {
        console.error("Error fetching study content:", error);
        toast.error("Erro ao carregar conteúdo");
      } finally {
        setLoadingStudy(false);
      }
    }

    fetchStudyContent();
  }, [session, status]);

  // Lógica para landing page (usuários deslogados)
  useEffect(() => {
    async function checkAccess() {
      if (session?.user && tracks.length > 0) {
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
    async function fetchLandingData() {
      if (session?.user) {
        setLoadingLanding(false);
        return;
      }

      try {
        setLoadingLanding(true);
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
        console.error("Erro ao carregar planos:", error);
        setSubscriptionPlans([]);
      } finally {
        setLoadingLanding(false);
      }
    }

    fetchLandingData();
  }, [session]);

  useEffect(() => {
    async function fetchPublicContent() {
      if (session?.user) return;

      try {
        const response = await fetch('/api/public/content');
        const data = await response.json();
        
        const sortedTracks = data.tracks.sort((a: LandingTrack, b: LandingTrack) => {
          const orderA = a.objective?.order ?? 0;
          const orderB = b.objective?.order ?? 0;
          return orderA - orderB;
        });

        setTracks(sortedTracks);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar conteúdo");
      }
    }
    fetchPublicContent();
  }, [session]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || session?.user) return;

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
  }, [session]);

  useEffect(() => {
    if (session?.user) return;
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  useEffect(() => {
    if (session?.user) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [tracks, session]);

  const getLessonIcon = (type: string) => {
    const props = { size: 14, strokeWidth: 2.5 };
    switch (type) {
      case 'CLASS': return <Video {...props} />;
      case 'FLASHCARD': return <Layers {...props} />;
      case 'STORY': return <BookText {...props} />;
      case 'READING': return <BookOpen {...props} />;
      default: return <GraduationCap {...props} />;
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return studyContent?.completedLessonIds.includes(lessonId) || false;
  };

  const renderAccessButton = (track: LandingTrack) => {
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

  const groupedTracks = tracks.reduce((acc: any, track: LandingTrack) => {
    const objId = track.objective?.id || 'default';
    if (!acc[objId]) {
      acc[objId] = {
        info: track.objective,
        tracks: []
      };
    }
    acc[objId].tracks.push(track);
    return acc;
  }, {});

  const SectionDivider = () => (
    <div className="relative w-screen left-1/2 -translate-x-1/2 h-12 md:h-32 z-45 pointer-events-none overflow-visible mb-10 mt-18">
      <div className="absolute left-1/2 -translate-x-1/2 w-[115vw] -translate-y-1/2 -rotate-2">
        <svg 
          className="w-full h-60 md:h-100 overflow-visible" 
          preserveAspectRatio="none" 
          viewBox="0 0 1440 100"
        >
          <defs>
            <filter id="torn-paper-rotate">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
            </filter>
          </defs>

          <path 
            d="M-100 100 L1540 100 L1540 30 L-100 35 Z" 
            fill="black" 
            className="opacity-[0.04]"
            filter="url(#torn-paper-rotate)"
            style={{ transform: 'translateY(-6px)' }}
          />

          <path 
            d="M-100 100 L1540 100 L1540 30 L-100 35 Z" 
            fill="#f8fafc" 
            filter="url(#torn-paper-rotate)"
          />
        </svg>

        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-60">
          <span className="text-[10px] font-bold uppercase tracking-[1.5em] text-s-900 font-frenchpress italic">
            Suivant
          </span>
        </div>
      </div>
    </div>
  );

  const handleRedirect = (url: string) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(url);
    }, 800);
  };

  // Se não estiver logado, mostrar landing page (apenas vídeo e planos)
  if (!session?.user) {
    if (loadingLanding) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-s-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clara-rose"></div>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-s-50 overflow-x-hidden">
        <section className="relative h-[85vh] min-h-[650px] flex items-center overflow-hidden bg-s-900">
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
            
            <div className="absolute inset-0 bg-linear-to-b from-blue-900/40 via-s-900/60 to-s-900 z-10"></div>
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
                <button
                  onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-xl"
                >
                  Ver Planos
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="relative w-full h-0 z-46 pointer-events-none overflow-visible">
          <div className="absolute left-1/2 -translate-x-1/2 w-[110vw] -translate-y-1/2 -rotate-2">
            <svg 
              className="w-full h-32 overflow-visible" 
              preserveAspectRatio="none" 
              viewBox="0 0 1440 100"
            >
              <path 
                d="M-100 100 L1540 100 L1540 30 L-100 35 Z" 
                fill="#f8fafc" 
                filter="url(#torn-paper-rotate)"
              />
            </svg>
          </div>
        </div>

        <div className="relative container mx-auto px-4 z-50">
          <section id="planos" className="py-12">
            <div className="text-center max-w-2xl mx-auto mb-4">
              <h2 className="text-4xl font-black mb-4 tracking-tight bg-linear-to-r from-clara-rose to-pink-500 text-transparent bg-clip-text py-2 px-4 rounded-full">Assinaturas</h2>
              <p className="text-[var(--color-s-50)]0">Invista no seu futuro com planos que cabem no seu bolso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {subscriptionPlans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  id={plan.id}
                  name={plan.name}
                  monthlyPrice={plan.monthlyPrice}
                  yearlyPrice={plan.yearlyPrice}
                  price={plan.price}
                  isBestValue={plan.isBestValue}
                  features={plan.features}
                  onSubscribe={(planId) => handleRedirect(`/assinar?planId=${planId}`)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Lógica para usuários logados (Duolingo)
  if (loadingStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-s-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clara-rose"></div>
      </div>
    );
  }

  const hasSubscription = studyContent?.hasActiveSubscription || false;
  const studyTracks = studyContent?.tracks || [];

  return (
    <main className="min-h-screen bg-s-50 overflow-x-hidden">
      {/* Banner para não-assinantes */}
      {!hasSubscription && (
        <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <div>
                <p className="font-bold">Desbloqueie todo o conteúdo!</p>
                <p className="text-sm text-blue-100">Acesso ilimitado a todas as trilhas e lições</p>
              </div>
            </div>
            <Link
              href="/assinar"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {studyTracks.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap size={64} className="mx-auto text-s-300 mb-4" />
            <h2 className="text-2xl font-bold text-s-900 mb-2">Nenhuma trilha disponível</h2>
            <p className="text-s-600">Em breve teremos conteúdo para você estudar!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {studyTracks.map((track) => {
              const totalLessons = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              const completedLessons = track.modules.reduce((sum, m) => 
                sum + m.lessons.filter(l => isLessonCompleted(l.id)).length, 0
              );
              const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

              return (
                <div 
                  key={track.id} 
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                    track.isLocked ? 'border-(--color-s-200) opacity-75' : 'border-transparent'
                  }`}
                >
                  {/* Header da trilha */}
                  <div 
                    className="p-8 text-white relative overflow-hidden"
                    style={{ backgroundColor: track.objective?.color || '#0f172a' }}
                  >
                    {track.imageUrl && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{ backgroundImage: `url(${track.imageUrl})` }}
                      />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon icon={track.objective?.icon} width={32} height={32} />
                            <span className="text-sm font-bold uppercase tracking-wider opacity-90">
                              {track.objective?.name}
                            </span>
                          </div>
                          <h2 className="text-3xl font-black mb-2">{track.name}</h2>
                          <p className="text-white/90 text-sm">{track.description}</p>
                        </div>
                        {track.isLocked && (
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <Lock size={20} />
                          </div>
                        )}
                      </div>

                      {/* Progresso */}
                      {!track.isLocked && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-bold">Progresso</span>
                            <span>{completedLessons} / {totalLessons} lições</span>
                          </div>
                          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Info para não-assinantes */}
                      {track.isLocked && track.freeLessonsCount !== undefined && (
                        <div className="mt-6 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                          <p className="text-sm font-bold mb-1">
                            {track.freeLessonsCount} lições gratuitas disponíveis
                          </p>
                          <p className="text-xs text-white/80">
                            Desbloqueie {track.totalLessonsCount! - track.freeLessonsCount} lições premium com uma assinatura
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Módulos e lições */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {track.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border-l-4 border-blue-200 pl-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                              module.isLocked 
                                ? 'bg-s-200 text-s-400' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {module.isLocked ? <Lock size={20} /> : module.order}
                            </div>
                            <h3 className="font-bold text-lg text-s-900">{module.title}</h3>
                            {module.isLocked && (
                              <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                Premium
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {module.lessons.map((lesson) => {
                              const completed = isLessonCompleted(lesson.id);
                              const isLocked = lesson.isPremium && !hasSubscription;

                              return (
                                <Link
                                  key={lesson.id}
                                  href={isLocked ? "/assinar" : `/?track=${track.id}&lesson=${lesson.id}`}
                                  className={`group relative p-4 rounded-xl border-2 transition-all ${
                                    completed
                                      ? 'bg-green-50 border-green-200'
                                      : isLocked
                                      ? 'bg-s-50 border-(--color-s-200) opacity-60 cursor-not-allowed'
                                      : 'bg-white border-(--color-s-200) hover:border-blue-300 hover:shadow-md'
                                  }`}
                                >
                                  {isLocked && (
                                    <div className="absolute top-2 right-2">
                                      <Lock size={16} className="text-s-400" />
                                    </div>
                                  )}
                                  {completed && (
                                    <div className="absolute top-2 right-2">
                                      <CheckCircle2 size={16} className="text-green-600" />
                                    </div>
                                  )}
                                  
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      completed
                                        ? 'bg-green-100 text-green-600'
                                        : isLocked
                                        ? 'bg-s-200 text-s-400'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      {getLessonIcon(lesson.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium text-sm ${
                                        isLocked ? 'text-s-400' : 'text-s-900'
                                      }`}>
                                        {lesson.title}
                                      </p>
                                      {isLocked && (
                                        <p className="text-xs text-s-400 mt-1">Premium</p>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Bloqueio de módulo premium */}
                          {module.isLocked && module.lessons.length === 0 && (
                            <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                              <Crown size={32} className="mx-auto text-yellow-600 mb-2" />
                              <p className="font-bold text-s-900 mb-1">Conteúdo Premium</p>
                              <p className="text-sm text-s-600 mb-4">
                                Este módulo está disponível apenas para assinantes
                              </p>
                              <Link
                                href="/assinar"
                                className="inline-block bg-linear-to-r from-clara-rose to-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                              >
                                Assinar Agora
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Botão de ação principal */}
                    <div className="mt-8 pt-6 border-t border-(--color-s-200)">
                      {track.isLocked ? (
                        <Link
                          href="/assinar"
                          className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-clara-rose to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          <Crown size={20} />
                          Desbloquear Trilha Completa
                        </Link>
                      ) : (
                        <Link
                          href={`/?track=${track.id}`}
                          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
                        >
                          <Play size={20} />
                          Continuar Estudando
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
