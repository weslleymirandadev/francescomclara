"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TbCurrencyDollar as DollarSign } from "react-icons/tb";
import { FiUser as User, FiChevronRight } from "react-icons/fi";
import {
  PiUsersThree as UserFriends,
  PiUsersThree as Users,
} from "react-icons/pi";
import {
  LuUserCheck as UserCheck,
  LuChartLine as ChartLine,
  LuCalendarArrowUp as CalendarArrowUp,
  LuCalendarCheck2 as CalendarCheck,  
  LuNotebookPen as NotebookPen
} from "react-icons/lu";

interface AdminStats {
  users: {
    total: number;
    active: number;
  };
  plans: {
    individual: number;
    family: number;
    monthly: number;
    yearly: number;
  };
  revenue: {
    monthly: number;
    total: number;
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100); // Converter de centavos para reais
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Painel de Controle</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gunmetal">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Painel de Controle</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-[var(--interface-accent)]">
            Tableau de Bord
          </h1>
          <p className="text-[var(--color-s-600)] font-medium">Controle total da plataforma Francês com Clara 🌸</p>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-s-500)]">Status do Sistema</span>
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Operacional
          </div>
        </div>
      </div>

      {/* Grid de Cards de Métricas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Alunos" 
          value={stats?.users.total || 0} 
          sub={`+${stats?.users.active} ativos agora`}
          icon={<Users className="text-[var(--interface-accent)]" />}
        />
        <MetricCard 
          title="Faturamento" 
          value={formatCurrency(stats?.revenue.total || 0)} 
          sub="Total acumulado"
          icon={<DollarSign className="text-[var(--clara-rose)]" />}
          highlight
        />
        <MetricCard 
          title="Planos Família" 
          value={stats?.plans.family || 0} 
          sub="Crescimento de 12%"
          icon={<UserFriends className="text-purple-500" />}
        />
        <MetricCard 
          title="Conversão" 
          value="24%" 
          sub="Inscritos para Alunos"
          icon={<ChartLine className="text-emerald-500" />}
        />
      </div>

      {/* Seção de Dados Detalhados */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Tabela de Usuários Recentes (Ocupa 2 colunas) */}
        <div className="lg:col-span-2 bg-white border-2 border-[var(--color-s-100)] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b-2 border-[var(--color-s-50)] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[var(--color-s-800)]">Derniers Étudiants</h3>
            <button className="text-xs font-bold text-[var(--interface-accent)] hover:underline">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-s-50)]/50">
                  <th className="p-4 text-xs font-black text-[var(--color-s-600)] uppercase tracking-widest">Estudante</th>
                  <th className="p-4 text-xs font-black text-[var(--color-s-600)] uppercase tracking-widest">Plano</th>
                  <th className="p-4 text-xs font-black text-[var(--color-s-600)] uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-[var(--color-s-600)] uppercase tracking-widest">Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-s-50)]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-[var(--color-s-50)]/50 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-s-100)] border-2 border-white shadow-sm flex items-center justify-center font-bold text-[var(--interface-accent)]">
                        JD
                      </div>
                      <div>
                        <div className="font-bold text-[var(--color-s-800)]">Jean Dupont</div>
                        <div className="text-xs text-[var(--color-s-400)]">jean@email.com</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 uppercase">Pro Anual</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Ativo
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-s-50)]0 font-medium">Hoje, 14:20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown de Assinaturas */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-[var(--color-s-100)] rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xl text-[var(--color-s-800)]mb-6">Planos Ativos</h3>
            <div className="space-y-4">
              <PlanRow label="Individual Mensal" value={stats?.plans.monthly} color="bg-[var(--interface-accent)]" total={stats?.users.total} />
              <PlanRow label="Individual Anual" value={stats?.plans.yearly} color="bg-sky-400" total={stats?.users.total} />
              <PlanRow label="Plano Família" value={stats?.plans.family} color="bg-[var(--clara-rose)]" total={stats?.users.total} />
            </div>
          </div>

          {/* Card de Atalho Rápido */}
          <div className="card-france-gradient border-2 border-[var(--color-s-100)] rounded-[2rem] p-6 group cursor-pointer hover:border-[var(--interface-accent)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:rotate-12 transition-transform">
                <CalendarCheck className="text-[var(--interface-accent)]" size={24} />
              </div>
              <FiChevronRight className="text-[var(--color-s-300)]" size={24} />
            </div>
            <h4 className="font-bold text-[var(--color-s-800)]">Relatório de Vendas</h4>
            <p className="text-xs text-[var(--color-s-50)]0">Gere um PDF detalhado do último mês.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-componentes para manter o código limpo
function MetricCard({ title, value, sub, icon, highlight = false }: any) {
  return (
    <Card className={`border-2 border-[var(--color-s-100)] rounded-[2rem] shadow-sm transition-all hover:shadow-xl ${highlight ? 'card-france-gradient border-[var(--clara-rose)]/20' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[var(--color-s-50)] rounded-xl">{icon}</div>
        </div>
        <div className="text-3xl font-black text-[var(--color-s-900)] tracking-tighter">{value}</div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-s-600)] mt-1">{title}</p>
        <p className="text-[10px] font-bold text-[var(--color-s-600)] mt-4 bg-[var(--color-s-50)] inline-block px-2 py-1 rounded-md">{sub}</p>
      </CardContent>
    </Card>
  );
}

function PlanRow({ label, value, color, total }: any) {
  const percentage = total ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
        <span className="text-[var(--color-s-600)]">{label}</span>
        <span className="text-[var(--color-s-900)]">{value}</span>
      </div>
      <div className="h-2 w-full bg-[var(--color-s-100)] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}