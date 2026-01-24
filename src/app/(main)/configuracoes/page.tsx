"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiUser, FiBell, FiLock, FiCheck, FiCreditCard } from "react-icons/fi";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FamilyMember {
  id: string;
  name: string | null;
  email: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        setUserData(data);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const isFamilyPlan = userData?.subscription?.type === 'FAMILY';
  const members = userData?.family?.members || [];
  const currentPlanName = userData?.subscription?.name || "Nenhum plano ativo";

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-[var(--color-s-50)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Configurações <span className="text-[var(--interface-accent)]">da Conta</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Gere a tua segurança e preferências de sistema
          </p>
        </div>

        <div className="space-y-8">
          
          <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem]">
            <h2 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
              <FiLock className="text-[var(--interface-accent)]" /> Segurança e Acesso
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Login</label>
                <input 
                  type="email" 
                  disabled
                  value={session?.user?.email || ""}
                  className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-bold text-sm cursor-not-allowed"
                />
              </div>
              <div className="flex items-end">
                <Link href="/auth/alterar-minha-senha" title="Alterar Senha" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    Alterar Palavra-passe
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem]">
            <h2 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
              <FiBell className="text-[var(--clara-rose)]" /> Notificações de Estudo
            </h2>
            
            <div className="space-y-4">
              {[
                { label: "Lembretes diários de flashcards", key: "flashcards" },
                { label: "Novas aulas disponíveis na trilha", key: "lessons" },
                { label: "Alertas de respostas no fórum", key: "forum" }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-none">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[var(--interface-accent)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {isFamilyPlan && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Membros do Plano ({members.length}/3)
                </h3>
              </div>
              
              <div className="space-y-3">
                {members.map((member: FamilyMember) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <span className="text-sm font-bold text-slate-700">{member.email}</span>
                    </div>
                    <Button variant="ghost" className="text-rose-500 text-[10px] font-black uppercase">Remover</Button>
                  </div>
                ))}
                
                {members.length < 3 && (
                  <button className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:border-[var(--interface-accent)] hover:text-[var(--interface-accent)] transition-all">
                    + Convidar Membro
                  </button>
                )}
              </div>
            </div>
          )}

          <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] border-l-8 border-l-[var(--interface-accent)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="flex items-center gap-3 text-sm font-black text-slate-800 uppercase tracking-widest mb-2">
                  <FiCreditCard className="text-[var(--interface-accent)]" /> O Teu Plano
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status: <span className="text-emerald-500">Ativo</span> • Premium Individual
                </p>
              </div>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Gerir Assinatura
              </Button>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button className="bg-[var(--interface-accent)] hover:scale-105 transition-all text-white px-12 h-16 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-200">
              <FiCheck className="mr-2" /> Guardar Configurações
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}