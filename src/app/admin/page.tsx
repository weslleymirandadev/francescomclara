"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TbCurrencyDollar as DollarSign } from "react-icons/tb";
import { FiUser as User } from "react-icons/fi";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Painel de Controle</h1>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.users.total || 0}</div>
            <p className="text-xs">Usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <UserCheck className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.users.active || 0}</div>
            <p className="text-xs">Com assinatura ativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <CalendarArrowUp className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(stats?.revenue.monthly || 0)}</div>
            <p className="text-xs">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(stats?.revenue.total || 0)}</div>
            <p className="text-xs">Todo o período</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Planos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Individual</CardTitle>
            <User className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.plans.individual || 0}</div>
            <p className="text-xs">Usuários no plano individual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Família</CardTitle>
            <UserFriends className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.plans.family || 0}</div>
            <p className="text-xs">Usuários no plano família</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Mensal</CardTitle>
            <CalendarCheck className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.plans.monthly || 0}</div>
            <p className="text-xs">Usuários no plano mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Anual</CardTitle>
            <ChartLine className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.plans.yearly || 0}</div>
            <p className="text-xs">Usuários no plano anual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resumo</CardTitle>
              <NotebookPen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Total de alunos:</span>
                <span className="text-sm font-medium">{stats?.users.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Alunos ativos:</span>
                <span className="text-sm font-medium">{stats?.users.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Receita do mês:</span>
                <span className="text-sm font-medium">{formatCurrency(stats?.revenue.monthly || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Receita total:</span>
                <span className="text-sm font-medium">{formatCurrency(stats?.revenue.total || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Distribuição de Planos</CardTitle>
              <NotebookPen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Individual:</span>
                <span className="text-sm font-medium">{stats?.plans.individual || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Família:</span>
                <span className="text-sm font-medium">{stats?.plans.family || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mensal:</span>
                <span className="text-sm font-medium">{stats?.plans.monthly || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Anual:</span>
                <span className="text-sm font-medium">{stats?.plans.yearly || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
