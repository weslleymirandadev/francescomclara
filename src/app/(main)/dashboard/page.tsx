'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBookOpen, FaGraduationCap, FaRegClock, FaSearch } from "react-icons/fa";
import { CheckCircle2 } from "lucide-react";
import { FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { MyPostsWidget } from "./components/MyPostsWidget";
import { toast } from "react-hot-toast";

interface Track {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  cefrLevel: string;
  modules: any[];
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
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<UserData | null>(null);

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
      const response = await fetch('/api/user/me');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API (HTML/Texto):", errorText);
        throw new Error('Falha ao carregar dados');
      }
      
      const userData = await response.json();
      setData(userData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSetLevel = async (level: string) => {
    try {
      const res = await fetch('/api/user/update', { 
        method: 'POST', 
        body: JSON.stringify({ 
          action: 'SET_LEVEL', 
          data: { level } 
        }) 
      });

      if (!res.ok) throw new Error();
      
      toast.success(`Nível definido como ${level}!`);
      fetchDashboardData();
    } catch (error) {
      toast.error("Erro ao definir nível");
    }
  };

  const filteredTracks = (data?.enrollments || []).filter((track) => {
    const search = searchTerm.toLowerCase();
    return (
      track.name?.toLowerCase().includes(search) ||
      track.description?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loading />;

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-s-50)] pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Bonjour, <span className="text-[var(--interface-accent)]">{data.profile.name?.split(' ')[0]}!</span>
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

        {/* CARD DE NÍVEL - Só aparece se o usuário NÃO tiver nível definido */}
        {!data.profile.level && (
          <Card className="mb-12 border-none shadow-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden relative group">
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
                  className="flex-1 md:flex-none h-14 px-8 bg-[var(--interface-accent)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                  onClick={() => router.push('/nivelamento')}
                >
                  Fazer Teste Grátis
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none h-14 px-8 border-white/10 bg-white/5 text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-2xl"
                  onClick={() => handleSetLevel('A1')}
                >
                  Sou Iniciante (A1)
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-[var(--interface-accent)] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
              <FaBookOpen size={20} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">{data.enrollments.length}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Cursos Ativos</p>
          </Card>

          <Card className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex flex-col justify-center items-center text-center group hover:bg-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mb-3 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
              <CheckCircle2 size={20} />
            </div>
            <h4 className="text-2xl font-black text-slate-900 group-hover:text-white">85%</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80">Concluído</p>
          </Card>

          <Link href="/forum" className="md:col-span-2">
            <Card className="p-6 h-full border-none shadow-xl bg-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 group hover:scale-[1.02] transition-all overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-white text-xl font-black uppercase tracking-tighter">Alguma dúvida?</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pergunte agora no fórum da Clara</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[var(--interface-accent)] text-white flex items-center justify-center shadow-lg relative z-10">
                <FiMessageSquare size={24} />
              </div>
            </Card>
          </Link>
        </div>

        {/* WIDGET DE POSTS */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6 px-2">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Minha Atividade</h2>
            <Link href="/forum/meus-posts" className="text-xs font-black text-[var(--interface-accent)] uppercase tracking-widest hover:underline">
              Gerenciar Posts
            </Link>
          </div>
          <MyPostsWidget />
        </div>

        {/* LISTA DE CURSOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTracks.map((track) => {
            const userLevel = data.profile.level || 'A1';
            const LEVEL_WEIGHT: any = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
            const isLocked = LEVEL_WEIGHT[track.cefrLevel] > LEVEL_WEIGHT[userLevel];

            return (
              <motion.div
                key={track.id}
                whileHover={!isLocked ? { y: -10 } : {}}
                className={`relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${isLocked ? 'opacity-60 grayscale' : ''}`}
              >
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
                          <FaBookOpen className="text-[var(--interface-accent)]" /> {track.modules?.length || 0} Módulos
                      </div>
                      
                      <button className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                        isLocked 
                        ? 'bg-slate-200 text-slate-400' 
                        : 'bg-[var(--interface-accent)] text-white hover:shadow-lg'
                      }`}>
                        {isLocked ? "Bloqueado" : "Continuar"}
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