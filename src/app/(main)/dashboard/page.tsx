'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { FaBookOpen, FaGraduationCap } from "react-icons/fa";
import { CheckCircle2, ArrowRight, Play, Lock, Layers } from "lucide-react";
import { FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { MyPostsWidget } from "./components/MyPostsWidget";
import { HeaderDashboard } from "./components/HeaderDashboard";

interface Track {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  objective: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  modules: Module[];
  hasAccess?: boolean;
}

interface Module {
  id: string;
  title: string;
  order: number;
  cefrLevel: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  isPremium: boolean;
}

interface UserData {
  profile: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    level: string | null;
    onboarded: boolean;
  };
  enrollments: Track[];
  subscription: any;
  completedLessonIds: string[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<UserData | null>(null);
  const [activeObjectiveId, setActiveObjectiveId] = useState<string | null>(null);
  const userPlanFeatures = data?.subscription?.features || [];
  const hasAllAccess = userPlanFeatures.includes('all_tracks');
  const lastTrackId = typeof window !== 'undefined' ? localStorage.getItem('lastTrackId') : null;
  const lastAccessedTrack = data?.enrollments.find(t => t.id === lastTrackId) || data?.enrollments[0];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const [resProfile, resContent] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/study-content')
      ]);

      const profileData = await resProfile.json();
      const contentData = await resContent.json();
      const allTracks = contentData.tracks || [];

      const sortedTracks = allTracks.sort((a: any, b: any) => {
        if (a.hasAccess && !b.hasAccess) return -1;
        if (!a.hasAccess && b.hasAccess) return 1;
        return 0;
      });

      setData({
        profile: profileData.user,
        enrollments: sortedTracks,
        completedLessonIds: contentData.completedLessonIds || [],
        subscription: profileData.subscription
      });
    } catch (error) {
      toast.error("Erro ao sincronizar dados");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (trackId: string) => {
    const track = data?.enrollments.find(t => t.id === trackId);
    if (!track) return 0;
    const allLessons = track.modules?.flatMap(m => m.lessons) || [];
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter(l => data?.completedLessonIds.includes(l.id)).length;
    return Math.round((completed / allLessons.length) * 100);
  };

  const getLessonIcon = (type: string) => {
    const props = { size: 14 };
    switch (type?.toLowerCase()) {
      case 'video': return <Play {...props} />;
      case 'reading': return <FaBookOpen {...props} />;
      case 'flashcards': return <Layers size={14} />; // Adiciona o import de Layers do lucide-react
      default: return <FaGraduationCap {...props} />;
    }
  };

  const filteredTracks = data ? data.enrollments
  .filter((track) => {
    const matchesSearch = track.name?.toLowerCase().includes(searchTerm.toLowerCase());
    // Se não houver objetivo selecionado explicitamente, mostra todas
    const matchesObjective = activeObjectiveId ? track.objective?.id === activeObjectiveId : true; 
    return matchesSearch && matchesObjective;
  }) : [];

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 text-left">
      <main className="max-w-7xl mx-auto px-6">
        
        <HeaderDashboard 
          name={data?.profile?.name || session?.user?.name || ''}
          isInsideTrack={false} 
          onBack={() => {}}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="animate-in fade-in duration-700">
          
          {data?.profile?.onboarded === false && (
            <Card className="mb-12 border-none shadow-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
              <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-(--interface-accent) border border-white/10 shadow-inner">
                    <FaGraduationCap size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Descubra seu nível</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Personalize sua jornada de aprendizado.</p>
                  </div>
                </div>
                <Button className="bg-(--interface-accent) text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-14 px-8" onClick={() => router.push('/nivelamento')}>
                  Fazer Teste Agora
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center group hover:bg-(--interface-accent) transition-all">
              <FaBookOpen size={20} className="text-slate-400 mb-3 group-hover:text-white" />
              <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">{data.enrollments.length}</h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Trilhas</p>
            </Card>

            <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center group hover:bg-emerald-500 transition-all">
              <CheckCircle2 size={20} className="text-slate-400 mb-3 group-hover:text-white" />
              <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">
                {(() => {
                  const all = data.enrollments.flatMap(t => t.modules.flatMap(m => m.lessons));
                  const relevantLessons = all.filter(l => l.type !== 'FLASHCARD');
                  if (relevantLessons.length === 0) return "0%";
                  const done = relevantLessons.filter(l => data.completedLessonIds.includes(l.id)).length;
                  return `${Math.round((done / relevantLessons.length) * 100)}%`;
                })()}
              </h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Progresso Total</p>
            </Card>

            <Link href="/forum" className="md:col-span-2">
              <Card className="p-6 h-full border-none shadow-xl bg-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 group hover:scale-[1.01] transition-all text-white">
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter">Comunidade</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Interaja com outros alunos</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-(--interface-accent) flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FiMessageSquare size={24} />
                </div>
              </Card>
            </Link>
          </div>

          {hasAllAccess && lastAccessedTrack && (
            <section className="mb-12 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-(--interface-accent) mb-2 block">Retomar Estudos</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">{lastAccessedTrack.name}</h2>
                
                <div className="w-full max-w-md bg-white/10 h-2 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="bg-(--interface-accent) h-full transition-all duration-1000" 
                    style={{ width: `${calculateProgress(lastAccessedTrack.id)}%` }} 
                  />
                </div>
                
                <Button 
                  onClick={() => router.push(`/curso/${lastAccessedTrack.id}`)} 
                  className="bg-(--interface-accent) hover:bg-white hover:text-slate-900 text-white font-bold h-12 px-8 rounded-xl"
                >
                  Continuar Agora <Play size={16} className="ml-2 fill-current" />
                </Button>
              </div>
            </section>
          )}

          <div className="mb-8 px-2">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Continuidade</h2>
            <p className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">Explorar Trilhas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTracks.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma trilha encontrada.</p>
              </div>
            ) : (
              filteredTracks.map((track: Track) => {
                const hasAccess = hasAllAccess || userPlanFeatures.includes(`track:${track.id}`) || track.hasAccess;
                const allTrackLessons = track.modules?.flatMap((m: any) => m.lessons) || [];

                const filteredTrackLessons = allTrackLessons.filter((l: any) => l.type !== 'FLASHCARD');

                const completedInTrack = filteredTrackLessons.filter((l: any) => 
                  data.completedLessonIds.includes(l.id)
                ).length;

                const trackProgress = filteredTrackLessons.length > 0 
                  ? Math.round((completedInTrack / filteredTrackLessons.length) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={track.id}
                    whileHover={hasAccess ? { y: -5 } : {}}
                    className={`relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 transition-all ${
                      !hasAccess ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'
                    }`}
                    onClick={() => {
                      if (!hasAccess) {
                        toast.error("Esta trilha não está incluída no seu plano atual.");
                        router.push('/assinar');
                        return;
                      }
                      router.push(`/curso/${track.id}`);
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={track.imageUrl || "/placeholder.png"} 
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          !hasAccess ? 'grayscale blur-[2px] opacity-60' : 'group-hover:scale-105'
                        }`} 
                      />
                      
                      {!hasAccess && (
                        <div className="cursor-pointer absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center text-white">
                          <Lock className="mb-2" size={24} />
                          <p className="text-[9px] font-black uppercase tracking-widest mb-3">Conteúdo Premium</p>
                          <span className="bg-white text-slate-900 text-[9px] font-black px-4 py-2 rounded-full uppercase shadow-lg">
                            Fazer Upgrade
                          </span>
                        </div>
                      )}

                      {hasAccess && (
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            Continuar Estudando <ArrowRight size={14} />
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-8 text-left">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">
                        {track.name}
                      </h3>

                      <div className="space-y-3 mb-6">
                        {track.modules?.[0]?.lessons?.slice(0, 3).map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="text-(--interface-accent) shrink-0">
                              {getLessonIcon(lesson.type)}
                            </div>
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        ))}
                        {(track.modules?.[0]?.lessons?.length > 3 || track.modules?.length > 1) && (
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-7">
                            + Conteúdo completo disponível
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                          <FaBookOpen className="text-(--interface-accent)" /> {track.modules?.length || 0} Módulos
                        </div>
                        {hasAccess && (
                          <span className="text-[10px] font-black text-emerald-500 uppercase">
                            {trackProgress}% concluído
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          <MyPostsWidget />
        </div>
      </main>
    </div>
  );
}