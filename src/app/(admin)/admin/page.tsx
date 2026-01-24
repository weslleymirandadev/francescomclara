"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TbCurrencyDollar as DollarSign } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";
import { PiUsersThree as Users } from "react-icons/pi";
import { ChartLine, User, FileText, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/price";
import { Loading } from '@/components/ui/loading'

interface AdminStats {
  users: { total: number; active: number; };
  plans: { individual: number; family: number; monthly: number; yearly: number; };
  revenue: { monthly: number; total: number; };
}

interface RecentStudent {
  id: string;
  name: string;
  planType: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, studentsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/recent-students')
        ]);
        
        if (!statsRes.ok) {
          const errorText = await statsRes.text();
          throw new Error(`Erro API Stats: ${errorText}`);
        }

        const statsData = await statsRes.json();
        setStats(statsData);

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setRecentStudents(studentsData);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto p-6 lg:p-10 bg-white min-h-screen">
      <header className="flex justify-between items-end border-b border-[var(--slate-100)] pb-8">
        <div>
          <h1 className="text-5xl font-bold font-frenchpress text-[var(--interface-accent)] uppercase tracking-tighter flex items-center gap-3">
            Tableau de Bord <img src="/static/flower.svg" alt="Flor" className="w-8 h-8 object-contain pointer-events-none" />
          </h1>
          <p className="text-[var(--slate-500)] font-medium mt-1">Francês com Clara • Gestão de Dados Reais</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Alunos" 
          value={stats?.users.total || 0} 
          sub="Cadastros na plataforma"
          icon={<Users size={20} />}
        />
        <MetricCard 
          title="Faturamento" 
          value={formatPrice(stats?.revenue.total || 0)} 
          sub="Receita líquida total"
          icon={<DollarSign size={20} />}
          highlight
        />
        <MetricCard 
          title="Planos Família" 
          value={stats?.plans.family || 0} 
          sub="Assinaturas ativas"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value={formatPrice(stats?.revenue.monthly || 0)} 
          sub="Mês vigente"
          icon={<ChartLine size={20} />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-[var(--slate-200)] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--slate-100)] p-6">
            <h3 className="text-sm font-black text-[var(--slate-800)] uppercase tracking-widest">Últimos Alunos</h3>
          </CardHeader>
          <Table>
            <TableHeader className="bg-[var(--slate-50)]">
              <TableRow>
                <TableHead className="text-[var(--slate-500)] uppercase text-[10px] font-black">Estudante</TableHead>
                <TableHead className="text-center text-[var(--slate-500)] uppercase text-[10px] font-black">Plano</TableHead>
                <TableHead className="text-right text-[var(--slate-500)] uppercase text-[10px] font-black">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentStudents.map((student) => (
                <TableRow key={student.id} className="border-b border-[var(--slate-50)]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--slate-100)] flex items-center justify-center text-[var(--interface-accent)] font-bold">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-[var(--slate-700)]">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[9px] font-black px-2 py-1 bg-[var(--slate-100)] text-[var(--slate-600)] rounded uppercase">
                      {student.planType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[var(--slate-400)] text-xs font-medium">
                    {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 border-none bg-gradient-to-br from-[var(--clara-rose)] to-[var(--slate-800)] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl tracking-tight flex items-center gap-2">
                    Rapport 
                    <img src="/static/flower.svg" alt="Flor" className="w-5 h-5 object-contain pointer-events-none"/>
                  </h4>
                  <p className="text-white/80 text-xs uppercase tracking-widest font-medium">Performance Mensal</p>
                </div>
              </div>
              
              <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                  <span className="text-white/80 text-sm">Receita Mensal</span>
                  <span className="font-bold text-lg">{formatPrice(stats?.revenue.monthly || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                  <span className="text-white/80 text-sm">Usuários Ativos</span>
                  <span className="font-bold text-lg">{stats?.users.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Proporção Anual</span>
                  <span className="font-bold text-lg">
                    {stats?.users.total ? ((stats.plans.yearly / stats.users.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <Button className="w-full bg-white text-[var(--clara-rose)] hover:bg-[var(--slate-50)] border-none font-black text-xs tracking-widest py-6 shadow-md transition-all active:scale-95 cursor-pointer">
                <FiDownload size={16} className="mr-2" />
                BAIXAR PDF
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-[var(--slate-200)] bg-white shadow-sm">
            <h3 className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-[0.2em] mb-8">Distribuição de Planos</h3>
            <div className="space-y-6">
              <PlanRow label="Individual" value={stats?.plans.individual} color="bg-[var(--interface-accent)]" total={stats?.users.total} />
              <PlanRow label="Família" value={stats?.plans.family} color="bg-[var(--clara-rose)]" total={stats?.users.total} />
              <PlanRow label="Mensal" value={stats?.plans.monthly} color="bg-[var(--slate-400)]" total={stats?.users.total} />
              <PlanRow label="Anual" value={stats?.plans.yearly} color="bg-[var(--slate-800)]" total={stats?.users.total} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon, highlight = false }: any) {
  return (
    <Card className={`p-8 border-(--color-s-200) shadow-sm transition-all hover:border-(--color-s-300) ${highlight ? 'bg-interface-accent text-white border-none shadow-interface-accent/20 shadow-lg' : 'bg-white'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${highlight ? 'bg-white/20 text-white' : 'bg-s-50 text-interface-accent'}`}>
        {icon}
      </div>
      <div className="text-4xl font-black tracking-tighter mb-1">{value}</div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-white/60' : 'text-s-400'}`}>
        {title}
      </p>
      <div className={`mt-6 inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase ${highlight ? 'bg-white/10 text-white' : 'bg-s-50 text-s-500'}`}>
        {sub}
      </div>
    </Card>
  );
}

function PlanRow({ label, value, color, total }: any) {
  const percentage = total ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-s-600">
        <span>{label}</span>
        <span className="text-s-900">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-s-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 ease-in-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}