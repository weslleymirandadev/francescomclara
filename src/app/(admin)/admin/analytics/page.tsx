"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Download,
  Target,
  ArrowRight,
  Loader2,
  FileText
} from "lucide-react";
import { formatPrice } from "@/lib/price";
import { Loading } from '@/components/ui/loading'

interface AnalyticsData {
  users: { total: number; active: number };
  plans: { individual: number; family: number; monthly: number; yearly: number };
  revenue: { monthly: number; total: number };
  recentStudents: Array<{
    id: string;
    name: string;
    createdAt: string;
    planType: string;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const stats = await response.json();
        setData(stats);
      } catch (err) {
        console.error("Erro no fetch de analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <Loading />;

  const ltvValue = data?.users.total 
    ? formatPrice(data.revenue.total / data.users.total) 
    : "R$ 0,00";

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 md:p-10 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
        
        {/* Header Limpo */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-s-100 pb-6 md:pb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-3xl md:text-5xl font-bold font-frenchpress text-interface-accent uppercase tracking-tighter flex items-center gap-2">
              Analytiques 🌸
            </h1>
            <p className="text-s-500 text-xs md:text-sm font-medium mt-1 italic">Saúde financeira em tempo real</p>
          </div>
          <button className="w-full sm:w-auto bg-s-900 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-interface-accent transition-all active:scale-95">
            <Download size={14} /> Exportar Relatório
          </button>
        </header>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          
          {/* MRR - Destaque Rosa */}
          <div className="bg-linear-to-br from-clara-rose to-[#b83d75] text-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-md relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                  <DollarSign size={20} />
                </div>
                <span className="bg-white/10 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-white/20">
                  Ao Vivo
                </span>
              </div>
              <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Receita Mensal</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{formatPrice(data?.revenue.monthly || 0)}</h2>
            </div>
          </div>

          {/* Churn Rate */}
          <div className="bg-white border border-s-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                <Target size={20} />
              </div>
              <span className="text-[9px] font-black text-s-400 uppercase tracking-widest italic">Meta &lt; 3%</span>
            </div>
            <p className="text-[9px] font-black text-s-400 uppercase tracking-[0.2em] mb-1">Taxa de Churn</p>
            <h2 className="text-3xl md:text-4xl font-black text-s-900 tracking-tighter">2.4%</h2>
            <div className="mt-4 md:mt-6 h-1 w-full bg-s-50 rounded-full overflow-hidden">
               <div className="h-full bg-rose-500 w-[24%]" />
            </div>
          </div>

          {/* LTV */}
          <div className="bg-white border border-s-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-sm sm:col-span-2 lg:col-span-1 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-[9px] font-black text-s-400 uppercase tracking-[0.2em] mb-1">LTV Médio</p>
            <h2 className="text-3xl md:text-4xl font-black text-s-900 tracking-tighter">{ltvValue}</h2>
            {/* Bandeira sutil no canto */}
            <div className="absolute top-0 right-0 w-1 h-full flex flex-col opacity-40">
              <div className="flex-1 bg-blue-600" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-red-600" />
            </div>
          </div>
        </div>

        {/* Lista de Transações - Estilo Branco Limpo */}
        <div className="bg-white border border-s-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-5 md:p-8 border-b border-s-50 flex items-center gap-2">
            <FileText size={18} className="text-interface-accent" />
            <h3 className="text-lg font-bold font-frenchpress text-s-800 uppercase tracking-tight">Flux de Trésorerie</h3>
          </div>
          
          <div className="divide-y divide-s-50">
            {data?.recentStudents && data.recentStudents.length > 0 ? (
              data.recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 md:p-6 md:px-10 hover:bg-s-50/30 transition-all group">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white border border-s-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-[12px] md:text-xl font-black text-s-900">
                        {new Date(student.createdAt).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-s-800 text-xs md:text-base truncate max-w-[140px] md:max-w-none">{student.name}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-s-400 uppercase tracking-widest">{student.planType}</p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 flex items-center gap-4 cursor-pointer">
                    <div>
                      <p className="font-black text-s-900 text-[9px] md:text-sm tracking-widest">ATIVO</p>
                      <p className="text-[8px] md:text-[10px] font-bold text-s-400 italic">
                        {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-s-200 group-hover:text-interface-accent hidden sm:block" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-s-400 text-xs font-bold italic">Nenhum registro encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}