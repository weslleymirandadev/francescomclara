"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiUser, FiBell, FiLock, FiGlobe, FiCheck } from "react-icons/fi";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadSettings() {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
    loadSettings();
    }, []);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-s-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clara-rose"></div>
        </div>
        );
    }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-s-800">Configurações</h1>
          <p className="text-s-500">Ajuste sua experiência na plataforma</p>
        </div>

        <div className="space-y-6">
          
          {/* Seção: Conta */}
          <section className="bg-white rounded-2xl shadow-sm border border-(--color-s-200) overflow-hidden">
            <div className="p-6 border-b border-(--color-s-100) bg-s-50/50">
              <h2 className="flex items-center gap-2 font-bold text-s-700">
                <FiUser className="text-interface-accent" /> Dados da Conta
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-s-400 uppercase tracking-wider ml-1">Nome de Exibição</label>
                  <input 
                    type="text" 
                    defaultValue={session?.user?.name || ""}
                    className="px-4 py-2.5 bg-s-50 border border-(--color-s-200) rounded-xl focus:ring-2 focus:ring-interface-accent outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-s-400 uppercase tracking-wider ml-1">E-mail</label>
                  <input 
                    type="email" 
                    disabled
                    value={session?.user?.email || ""}
                    className="px-4 py-2.5 bg-s-100 border border-(--color-s-200) rounded-xl text-s-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção: Preferências */}
          <section className="bg-white rounded-2xl shadow-sm border border-(--color-s-200) overflow-hidden">
            <div className="p-6 border-b border-(--color-s-100) bg-s-50/50">
              <h2 className="flex items-center gap-2 font-bold text-s-700">
                <FiBell className="text-clara-rose" /> Notificações e Estudo
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {[
                "Receber lembretes diários de flashcards",
                "Notificações de novas aulas na trilha",
                "Resumo semanal de progresso por e-mail"
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-s-600 font-medium">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={index === 0} />
                    <div className="w-11 h-6 bg-s-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-interface-accent"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Botões de Ação Final */}
          <div className="flex justify-end gap-4 mt-8">
            <button className="px-8 py-3 bg-interface-accent text-white font-bold rounded-xl hover:bg-[#004487] transition-all shadow-md flex items-center gap-2">
              <FiCheck /> Salvar Alterações
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}