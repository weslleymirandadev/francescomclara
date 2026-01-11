"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FiMail, FiCalendar, FiShield, FiEdit3 } from "react-icons/fi";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadUserData() {
      setTimeout(() => {
        setLoading(false);
        }, 1000);
    }
    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-s-50)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clara-rose)]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-[var(--color-s-50)]">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-s-200)] overflow-hidden">
          
          {/* Header do Perfil (Banner simples) */}
          <div className="h-32 bg-gradient-to-r from-[var(--interface-accent)] to-[var(--clara-rose)] opacity-90" />

          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-end -mt-12 gap-6">
              {/* Foto de Perfil */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-[var(--color-s-200)] shadow-md">
                  {user?.image ? (
                    <Image 
                      src={user.image} 
                      alt="Avatar" 
                      width={128} 
                      height={128}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--color-s-400)]">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg text-[var(--color-s-600)] hover:text-[var(--clara-rose)] transition-colors">
                  <FiEdit3 size={16} />
                </button>
              </div>

              {/* Nome e Badge */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-[var( --color-s-800)]flex items-center gap-2">
                  {user?.name || "Usuário"}
                  <span className="text-xs font-bold px-2 py-1 bg-[var(--interface-accent)]/10 text-[var(--interface-accent)] rounded-full uppercase tracking-wider">
                    Aluno Pro 🌸
                  </span>
                </h1>
                <p className="text-[var(--color-s-50)]0">Membro desde Janeiro de 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Coluna 1: Informações Pessoais */}
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-[var(--color-s-400)] uppercase tracking-widest">Informações Pessoais</h2>
                
                <div className="flex items-center gap-4 p-4 bg-[var(--color-s-50)] rounded-xl border border-[var(--color-s-100)]">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-[var(--interface-accent)]">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-s-400)] font-medium">E-mail</p>
                    <p className="text-[var(--color-s-700)] font-semibold">{user?.email || "Não informado"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[var(--color-s-50)] rounded-xl border border-[var(--color-s-100)]">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-[var(--clara-rose)]">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-s-400)] font-medium">Nível de Acesso</p>
                    <p className="text-[var(--color-s-700)] font-semibold">Plano Individual</p>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Estatísticas Rápidas */}
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-[var(--color-s-400)] uppercase tracking-widest">Seu Progresso</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--interface-accent)]/5 rounded-xl border border-[var(--interface-accent)]/10 text-center">
                    <p className="text-2xl font-bold text-[var(--interface-accent)]">12</p>
                    <p className="text-xs text-[var(--color-s-50)]0 font-medium">Aulas Concluídas</p>
                  </div>
                  <div className="p-4 bg-[var(--clara-rose)]/5 rounded-xl border border-[var(--clara-rose)]/10 text-center">
                    <p className="text-2xl font-bold text-[var(--clara-rose)]">85</p>
                    <p className="text-xs text-[var(--color-s-50)]0 font-medium">Flashcards Masterizados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações da Conta */}
            <div className="mt-12 pt-8 border-t border-[var(--color-s-100)] flex gap-4">
              <button className="px-6 py-2 bg-[var( --color-s-800)]text-white rounded-lg font-bold hover:bg-[var(--color-s-700)] transition-colors">
                Editar Perfil
              </button>
              <button className="px-6 py-2 bg-white text-[var(--color-s-600)] border border-[var(--color-s-200)] rounded-lg font-bold hover:bg-[var(--color-s-50)] transition-colors">
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}