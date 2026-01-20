"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FiUser, FiBell, FiLock, FiCheck, FiCreditCard } from "react-icons/fi";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

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
          
          {/* SEÇÃO: SEGURANÇA (SENHA) */}
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
                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50">
                  Alterar Palavra-passe
                </Button>
              </div>
            </div>
          </Card>

          {/* SEÇÃO: NOTIFICAÇÕES (O QUE JÁ TINHAS) */}
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

          {/* SEÇÃO: PLANO (NOVO - BASEADO NO PRISMA) */}
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