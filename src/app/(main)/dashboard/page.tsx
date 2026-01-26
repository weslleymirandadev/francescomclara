'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { FaBookOpen, FaGraduationCap, FaRegClock } from "react-icons/fa";
import { CheckCircle2 } from "lucide-react";
import { FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { MyPostsWidget } from "./components/MyPostsWidget";
import { HeaderDashboard } from "./components/HeaderDashboard";
import { TrackContent } from "./components/TrackContent";
import { Icon } from "@iconify/react";

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
  
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeObjectiveId, setActiveObjectiveId] = useState<string | null>(null);

  const objectives = data ? Array.from(new Set(data.enrollments.map(e => e.objective?.id)))
    .map(id => data.enrollments.find(e => e.objective?.id === id)?.objective)
    .filter((obj): obj is NonNullable<typeof obj> => !!obj) : [];

  useEffect(() => {
    if (data && objectives.length > 0 && !activeObjectiveId) {
      setActiveObjectiveId(objectives[0].id);
    }
  }, [data, objectives, activeObjectiveId]);
    

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

      if (!resProfile.ok || !resContent.ok) throw new Error('Falha ao carregar');

      const profileData = await resProfile.json();
      const contentData = await resContent.json();

      setData({
        profile: profileData.user || {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          image: session?.user?.image || '',
          level: null
        },
        enrollments: contentData.tracks || [],
        completedLessonIds: contentData.completedLessonIds || [],
        subscription: contentData.hasActiveSubscription
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSetLevel = async (level: string) => {
    try {
      const res = await fetch('/api/user/update', { 
        method: 'POST', 
        body: JSON.stringify({ action: 'SET_LEVEL', data: { level } }) 
      });
      if (!res.ok) throw new Error();
      toast.success(`Nível definido como ${level}!`);
      fetchDashboardData();
    } catch (error) {
      toast.error("Erro ao definir nível");
    }
  };

  const filteredTracks = data ? data.enrollments.filter((track) => {
    const matchesSearch = track.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObjective = activeObjectiveId 
      ? track.objective?.id === activeObjectiveId 
      : true;

    return matchesSearch && matchesObjective;
  }) : [];

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-(--slate-50) pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        
        <HeaderDashboard 
          name={data?.profile?.name || session?.user?.name || ''}
          isInsideTrack={!!selectedTrack} 
          onBack={() => setSelectedTrack(null)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {selectedTrack ? (
          <TrackContent 
            track={selectedTrack} 
            completedIds={data.completedLessonIds || []} 
          />
        ) : (
          <div className="animate-in fade-in duration-700">
            
            {!data.profile.level && (
              <Card className="mb-12 border-none shadow-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
                <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-(--interface-accent) border border-white/10 shadow-inner">
                      <FaGraduationCap size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Defina seu nível</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Libere as trilhas ideais.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button className="bg-(--interface-accent) text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-14 px-8" onClick={() => router.push('/nivelamento')}>Fazer Teste</Button>
                    <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-2xl h-14 px-8" onClick={() => handleSetLevel('A1')}>Sou Iniciante</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-(--interface-accent) transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
                  <FaBookOpen size={20} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">{data.enrollments.length}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Trilhas Ativas</p>
              </Card>

              <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-emerald-500 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">
                  {(() => {
                    const allLessons = data.enrollments.flatMap(t => t.modules.flatMap(m => m.lessons));
                    const total = allLessons.length;
                    if (total === 0) return "0%";
                    const completed = allLessons.filter(l => data.completedLessonIds.includes(l.id)).length;
                    return `${Math.round((completed / total) * 100)}%`;
                  })()}
                </h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Progresso Geral</p>
              </Card>

              <Link href="/forum" className="md:col-span-2">
                <Card className="p-6 h-full border-none shadow-xl bg-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 group hover:scale-[1.01] transition-all relative overflow-hidden text-left">
                  <div className="relative z-10">
                    <h4 className="text-white text-xl font-black uppercase tracking-tighter">Comunidade</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Tire dúvidas no fórum</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-(--interface-accent) text-white flex items-center justify-center relative z-10">
                    <FiMessageSquare size={24} />
                  </div>
                </Card>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mb-8 px-2">
              {objectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setActiveObjectiveId(obj.id)}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    activeObjectiveId === obj.id 
                      ? 'bg-slate-900 text-white shadow-xl scale-105' 
                      : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  {obj.name}
                </button>
              ))}
            </div>

            {activeObjectiveId && (
              <div 
                className="mb-12 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-700"
                style={{ 
                  backgroundColor: (objectives.find(o => o.id === activeObjectiveId)?.color || '#000') + '15' 
                }}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <Icon 
                    icon={objectives.find(o => o.id === activeObjectiveId)?.icon || "ph:target-bold"} 
                    width={200} 
                    style={{ color: objectives.find(o => o.id === activeObjectiveId)?.color }}
                    className="rotate-12"
                  />
                </div>
                <div className="relative z-10 text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: objectives.find(o => o.id === activeObjectiveId)?.color }}>
                    Foco de Estudo
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mt-1">
                    {objectives.find(o => o.id === activeObjectiveId)?.name}
                  </h2>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredTracks.map((track) => {
                const levels = track.modules?.map(m => m.cefrLevel).filter(Boolean) || [];
                const displayLevel = levels.length > 0 
                  ? (levels.length > 1 ? `${levels[0]} • ${levels[levels.length - 1]}` : levels[0])
                  : "Geral";

                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ y: -10 }}
                    className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl transition-all cursor-pointer group text-left"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="relative h-56 overflow-hidden">
                      {track.imageUrl ? (
                        <img src={track.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={track.name} />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                          <Icon icon={track.objective?.icon || "ph:graduation-cap-fill"} width={60} style={{ color: track.objective?.color }} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 text-[9px] font-black bg-white/90 text-slate-800 rounded-full uppercase tracking-widest shadow-sm">
                          {displayLevel}
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.objective?.color || '#cbd5e1' }} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {track.objective?.name}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4 leading-tight">
                        {track.name}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                          <FaBookOpen className="text-(--interface-accent)" /> {track.modules?.length || 0} Módulos
                        </div>
                        
                        <button className="bg-(--interface-accent) text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:shadow-lg transition-all">
                          Acessar Conteúdo
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mb-12">
              <div className="flex justify-between items-end mb-8 px-2">
                <div>
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Engajamento</h2>
                  <p className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">Minha Atividade</p>
                </div>
                <Link href="/forum/meus-posts" className="text-[10px] font-black text-(--interface-accent) uppercase tracking-widest hover:underline">Ver Histórico</Link>
              </div>
              <MyPostsWidget />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}