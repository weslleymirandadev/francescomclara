'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBook, FaBookOpen, FaGraduationCap, FaRegClock, FaSearch } from "react-icons/fa";
import { BiDirections } from "react-icons/bi";
import { CheckCircle2 } from "lucide-react";
import { FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { MyPostsWidget } from "./components/MyPostsWidget";

interface Track {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  cefrLevel: string;
  modules: any[];
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  level: string;
  modules: Module[];
}

interface DashboardData {
  user: { id: string; name: string | null; email: string; image: string | null; };
  tracks: Track[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<{ 
    user: DashboardData['user']; 
    tracks: Track[]
  } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/enrollments');
      const { tracks } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      setData({
        user: {
          id: session?.user?.id || '',
          name: session?.user?.name || null,
          email: session?.user?.email || '',
          image: session?.user?.image || null,
        },
        tracks: tracks || [],
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = (data?.tracks || []).filter((track: Track) => {
    const search = searchTerm.toLowerCase();
    return (
      track.name?.toLowerCase().includes(search) ||
      track.description?.toLowerCase().includes(search)
    );
  });

  if (loading || !data) return <Loading />;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Erro ao carregar o dashboard</h2>
          <p className="mt-2 text-gray-600">Por favor, tente novamente mais tarde.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[var(--color-s-50)] pt-24 pb-20">
    <main className="max-w-7xl mx-auto px-6">
      
      {/* HEADER DO DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Bonjour, <span className="text-[var(--interface-accent)]">{data.user.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Pronto para continuar sua jornada no Francês?
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="BUSCAR CURSOS..."
            className="w-full pl-12 pr-4 h-14 bg-white border-none shadow-xl rounded-2xl font-bold text-xs uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-[var(--interface-accent)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!(session?.user as any)?.level && (
        <Card className="mb-12 border-none shadow-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden relative group">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--interface-accent)] opacity-10 blur-[100px] -mr-20 -mt-20 group-hover:opacity-20 transition-opacity duration-700" />
          
          <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-[var(--interface-accent)] border border-white/10 shadow-inner">
                <FaGraduationCap size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  Defina seu nível de Francês
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">
                  Libere as trilhas ideais para o seu conhecimento atual.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button 
                className="flex-1 md:flex-none h-14 px-8 bg-[var(--interface-accent)] hover:bg-[var(--interface-accent)] hover:scale-105 active:scale-95 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all duration-300 cursor-pointer shadow-lg shadow-[var(--interface-accent)]/20"
                onClick={() => router.push('/nivelamento')}
              >
                Fazer Teste Grátis
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 md:flex-none h-14 px-8 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all duration-300 cursor-pointer"
                onClick={async () => {
                  await fetch('/api/user/set-level', { 
                    method: 'POST', 
                    body: JSON.stringify({ level: 'A1' }) 
                  });
                  window.location.reload();
                }}
              >
                Sou Iniciante (A1)
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-[var(--interface-accent)] transition-all duration-500">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
            <FaBookOpen size={20} />
          </div>
          <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">{data?.tracks?.length || 0}</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Cursos Ativos</p>
        </Card>

        <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-emerald-500 transition-all duration-500">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
            <CheckCircle2 size={20} />
          </div>
          <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">85%</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Concluído</p>
        </Card>

        {/* CARD DE ATALHO PARA O FÓRUM - SUPER IMPORTANTE */}
        <Link href="/forum" className="md:col-span-2">
          <Card className="p-6 h-full border-none shadow-xl bg-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 group hover:scale-[1.02] transition-all overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-white text-xl font-black uppercase tracking-tighter">Alguma dúvida?</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pergunte agora no fórum da Clara</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[var(--interface-accent)] text-white flex items-center justify-center shadow-lg relative z-10 group-hover:rotate-12 transition-transform">
              <FiMessageSquare size={24} />
            </div>
            {/* Decoração de fundo */}
            <div className="absolute -right-4 -bottom-4 opacity-10 text-white rotate-12 group-hover:scale-150 transition-transform duration-700">
              <FiMessageSquare size={120} />
            </div>
          </Card>
        </Link>
      </div>

      <div>
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Minha Atividade
          </h2>
          {/* Link para a página de edição/exclusão que você já tem */}
          <Link 
            href="/forum/meus-posts" 
            className="text-xs font-black text-[var(--interface-accent)] uppercase tracking-widest hover:underline"
          >
            Gerenciar Posts
          </Link>
        </div>
        
        {/* O WIDGET ENTRA AQUI */}
        <MyPostsWidget />
      </div>

      {/* CURSOS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTracks.map((track: Track) => {
          const isEnrolled = true;

          const userLevel = (session?.user as any)?.level || 'A1';
          const LEVEL_WEIGHT: any = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
          const isLocked = LEVEL_WEIGHT[track.cefrLevel] > LEVEL_WEIGHT[userLevel];

          return (
            <motion.div
              key={track.id}
              whileHover={!isLocked ? { y: -10 } : {}}
              className={`relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${isLocked ? 'opacity-60 grayscale' : ''}`}
            >
              {/* Overlay de Bloqueio */}
              {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] text-white p-6 text-center">
                  <FaRegClock size={30} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Bloqueado</p>
                  <p className="text-[9px] opacity-80 uppercase">Requer nível {track.cefrLevel}</p>
                </div>
              )}

              <Link href={isLocked ? "#" : `/dashboard/cursos/${track.id}`} className={isLocked ? "cursor-not-allowed" : ""}>
                <div className="relative h-56 overflow-hidden">
                  {track.imageUrl ? (
                    <img src={track.imageUrl} className="w-full h-full object-cover" alt={track.name} />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                      <FaGraduationCap size={40} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 text-[9px] font-black bg-white/90 text-slate-800 rounded-full uppercase tracking-widest">
                      {track.cefrLevel}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-3">
                    {track.name || ""}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                        <FaBookOpen className="text-[var(--interface-accent)]" /> {track.modules.length} Módulos
                    </div>
                    
                    {/* Botão Dinâmico baseada no estado que você queria */}
                    <button className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                      isLocked 
                      ? 'bg-slate-200 text-slate-400' 
                      : 'bg-[var(--interface-accent)] text-white hover:shadow-lg'
                    }`}>
                      {isLocked ? "Nível Insuficiente" : "Continuar"}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  </div>
);
}