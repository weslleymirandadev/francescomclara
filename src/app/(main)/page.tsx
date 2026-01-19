"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";
import { useRouter } from "next/navigation";
import { BookOpen, Video, GraduationCap, CheckCircle2, Clock, Layers, BookText } from "lucide-react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { getGlobalData } from "./actions/settings";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

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
  const [isExiting, setIsExiting] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

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
    async function load() {
      setLoading(true);
      try {
        const data = await getGlobalData();
        if (data && data.plans) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/public/content');
        const data = await response.json();
        
        const sortedTracks = data.tracks.sort((a: Track, b: Track) => {
          const orderA = a.objective?.order ?? 0;
          const orderB = b.objective?.order ?? 0;
          return orderA - orderB;
        });

        setTracks(sortedTracks);
        setPlans(data.plans);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar conteúdo");
      } finally {
        setLoading(false);
      }
    }
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

  useEffect(() => {
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
  }, [tracks]);

  const getLessonIcon = (type: string) => {
    const props = { size: 14, strokeWidth: 2.5 };
    switch (type) {
      case 'CLASS': return <Video {...props} />;
      case 'FLASHCARDS': return <Layers {...props} />;
      case 'STORY': return <BookText {...props} />;
      case 'READING': return <BookOpen {...props} />;
      default: return <GraduationCap {...props} />;
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

  const groupedTracks = tracks.reduce((acc: any, track: Track) => {
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
    <div className="relative w-screen left-1/2 -translate-x-1/2 h-12 md:h-32 z-[45] pointer-events-none overflow-visible mb-10 mt-18">
      <div className="absolute left-1/2 -translate-x-1/2 w-[115vw] -translate-y-1/2 -rotate-[2deg]">
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

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-[var(--color-s-50)] overflow-x-hidden">
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
              <button
                onClick={() => document.getElementById('trilhas')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-xl cursor-pointer"
              >
                Explorar Trilhas
              </button>
              <button
                onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all cursor-pointer"
                >
                Ver Planos
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="relative w-full h-0 z-[46] pointer-events-none overflow-visible">
        <div className="absolute left-1/2 -translate-x-1/2 w-[110vw] -translate-y-1/2 rotate-[-2deg]">
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

      <div className="relative container mx-auto px-4 py-16">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[5%] -rotate-12" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
            <Icon icon="ph:airplane-tilt-fill" className="w-[120px] md:w-[250px]" />
          </div>
          <div className="absolute top-[25%] right-[8%] rotate-12" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
            <Icon icon="ph:briefcase-fill" className="w-[100px] md:w-[200px]" />
          </div>
          <div className="absolute top-[44%] left-[10%] rotate-[25deg]" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
            <Icon icon="ph:graduation-cap-fill" className="w-[110px] md:w-[220px]" />
          </div>
          <div className="absolute top-[65%] right-[5%] -rotate-6" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
            <Icon icon="ph:users-three-fill" className="w-[140px] md:w-[280px]" />
          </div>
          <div className="absolute top-[85%] left-[15%] rotate-12" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
            <Icon icon="ph:leaf-fill" className="w-[90px] md:w-[180px]" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-24" id="trilhas">
          {Object.values(groupedTracks).map((group: any, index: number) => {
            const objective = group.info;
            if (!objective) return null;
            const mainAngle = objective.iconRotate || 0;
            const badgeAngle = mainAngle * 0.1;

            return (
              <div key={objective.id} className="relative w-full">
                <SectionDivider />
                <section key={objective.id} className="relative w-full max-w-7xl mx-auto overflow-visible transition-all duration-1000 ease-out translate-y-10 opacity-0 scroll-reveal">
                  
                  <div className="relative w-full">
                    <div className="relative left-1/2 -translate-x-1/2 w-screen md:left-0 md:translate-x-0 md:w-full">
                      
                      <div className="relative w-full h-72 md:h-100 rounded-4xl overflow-hidden bg-s-900 shadow-[-32px_-32px_64px_-16px_rgba(0,0,0,0.2)] group/sep">
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-[2000ms] group-hover/sep:scale-110"
                          style={{ backgroundImage: `url(${objective.imageUrl || ''})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-20 z-20">
                          <span className="text-[10px] font-black uppercase text-interface-accent tracking-[0.5em] block mb-2 drop-shadow-md">Objectif</span>
                          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter font-frenchpress leading-none">{objective.name}</h2>
                        </div>

                        <div className="absolute -top-7 right-40 z-20 text-white hidden md:block">
                          <Icon icon={objective.icon} width={80} height={80} className="rotate-[25deg]" />
                        </div>
                        <div className="absolute top-2 right-20 z-20 text-white block md:hidden">
                          <Icon icon={objective.icon} width={50} height={50} className="rotate-[25deg]" />
                        </div>
                      </div>

                      <div className="absolute -bottom-35 -right-16 z-10 text-s-50 pointer-events-none hidden md:block" style={{ transform: `rotate(${mainAngle}deg)` }}>
                        <Icon icon={objective.icon} width={250} height={250} />
                      </div>

                      <div className="absolute -bottom-15 -right-7 z-10 text-s-50 pointer-events-none block md:hidden" style={{ transform: `rotate(${mainAngle}deg)` }}>
                        <Icon icon={objective.icon} width={125} height={125} />
                      </div>

                      <div className="absolute -bottom-10 md:-bottom-14 -left-16 z-10 transition-all duration-700 ease-out group-hover/sep:rotate-[5deg] group-hover/sep:-translate-y-2" style={{ transform: `rotate(${badgeAngle}deg)` }}>
                        <div className="bg-s-50 p-7 rounded-[32px] border border-s-50 hidden md:block">
                          <Icon icon={objective.icon} width={48} height={48} className="text-s-900" />
                        </div>
                        <div className="bg-s-50 p-5 rounded-[32px] border border-s-50 block md:hidden">
                          <Icon icon={objective.icon} width={32} height={32} className="text-s-900" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-20 px-6 relative z-20 mt-8">
                    {group.tracks.map((track: Track) => {
                      const totalLessons = track.modules.reduce((sum, module) => sum + module.lessons.length, 0);
                      return (
                        <div key={track.id} className="group bg-white rounded-md md:rounded-[40px] md:border md:border-s-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                          <div className="flex flex-col lg:flex-row">
                            <div 
                              className="lg:w-1/3 p-12 text-white flex flex-col justify-between relative overflow-hidden min-h-[450px]"
                              style={{ backgroundColor: track.objective?.color || '#0f172a' }}
                            >
                              {track.imageUrl && (
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${track.imageUrl})` }} />
                              )}
                              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors" />
                              <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-4 leading-none font-frenchpress uppercase tracking-tighter">{track.name}</h3>
                                <p className="text-white/80 text-sm leading-relaxed line-clamp-4">{track.description}</p>
                              </div>
                              <div className="relative z-10 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                                  <Clock size={12} className="text-interface-accent" /> {totalLessons} lições
                                </div>
                                {renderAccessButton(track)}
                              </div>
                            </div>

                            <div className="lg:w-2/3 p-6 md:p-12 bg-white/80 backdrop-blur-xl relative overflow-hidden">
                              <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none">
                                <Icon icon="ph:book-open-thin" width={300} />
                              </div>
                              <h4 className="text-[10px] font-black text-s-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                <span className="w-8 h-[1px] bg-s-200"></span>
                                Programme de formation
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                {track.modules.map((module) => (
                                  <div key={module.id}>
                                    <div className="flex items-center gap-3 mb-4">
                                      <span className="text-[10px] font-black text-interface-accent">0{module.order}</span>
                                      <h5 className="font-black text-s-900 text-sm uppercase">{module.title}</h5>
                                    </div>
                                    <ul className="space-y-3">
                                      {module.lessons.slice(0, 3).map(lesson => (
                                        <li key={lesson.id} className="text-xs text-s-500 flex items-center gap-3 font-medium">
                                          <div className="text-s-400 shrink-0">
                                            {getLessonIcon(lesson.type)}
                                          </div> 
                                          <span className="truncate">{lesson.title}</span>
                                        </li>
                                      ))}
                                      
                                      {module.lessons.length > 3 && (
                                        <li className="text-[9px] text-[var(--interface-accent)] font-bold uppercase tracking-widest pl-6">
                                          + {module.lessons.length - 3} atividades
                                        </li>
                                      )}
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
              </div>
            );
          })}
        </div>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden group">
              {/* Decoração de fundo */}
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Icon icon="ph:chats-teardrop-fill" width={200} />
              </div>

              <div className="relative z-10 max-w-2xl">
                <span className="text-[var(--interface-accent)] font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">
                  Communauté d'apprentissage
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                  Ficou com alguma dúvida <br/> nas lições?
                </h2>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                  Participe do nosso fórum exclusivo. Lá você pode tirar dúvidas diretamente 
                  com a Clara, ajudar outros alunos e praticar seu francês com a comunidade.
                </p>
              </div>
                
              <Link href="/forum">
                <Button className="bg-[var(--interface-accent)] hover:bg-white hover:text-slate-900 text-white px-10 h-16 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                  Explorar o Fórum
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="planos" className="py-12 border-t border-[var(--color-s-200)]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[var(--color-s-900)] mb-4 tracking-tight">Assinaturas</h2>
            <p className="text-[var(--color-s-50)]0">Invista no seu futuro com planos que cabem no seu bolso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans?.map((plan) => (
              <div 
                key={plan.id} 
                className="relative p-8 rounded-[2.5rem] bg-white border-2 border-[var(--color-s-100)] shadow-sm hover:border-[var(--interface-accent)] transition-all group flex flex-col h-full"
              >
                {plan.period === 'YEARLY' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--interface-accent)] text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl">
                    Melhor Valor 
                    <img src="/static/flower.svg" alt="Flor" className="w-4 h-4 object-contain pointer-events-none" />
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-frenchpress font-bold text-[var(--color-s-900)] uppercase tracking-tighter">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[var(--color-s-400)] font-medium italic">
                    {plan.description || "Acesso completo à plataforma"}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-[var(--color-s-900)] tracking-tighter">
                    {formatPrice(
                      plan.price / (plan.period === 'YEARLY' ? 12 : 1)
                    )}
                  </span>
                  <span className="text-[var(--color-s-400)] text-sm font-bold uppercase tracking-widest">
                    /mês
                  </span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-[var(--color-s-600)]">
                      <div className="p-0.5 bg-emerald-50 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                    handleRedirect(`/assinar?planId=${plan.id}`);
                  }}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-[var(--color-s-900)] text-white hover:bg-[var(--interface-accent)] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex justify-center items-center h-14"
                >
                  {loading ? (
                    <Icon icon="line-md:loading-twotone-loop" width={24} />
                  ) : (
                    "Commencer Maintenant"
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}