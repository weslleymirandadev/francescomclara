"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiShield, FiEdit3, FiCamera, FiLock } from "react-icons/fi";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        // Atualiza a sessão do NextAuth para refletir a nova imagem
        await update({ ...session, user: { ...session?.user, image: data.imageUrl } });
        window.location.reload(); // Força atualização visual
      }
    } catch (err) {
      alert("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 bg-slate-50 relative overflow-hidden">
      {/* Decoração de fundo tricolor sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#002395] via-white to-[#ED2939]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
          
          <div className="h-40 bg-slate-900 relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000')] bg-cover bg-center" />
          </div>

          <div className="px-10 pb-12">
            <div className="relative flex flex-col md:flex-row items-end -mt-16 gap-8">
              {/* Foto de Perfil com Upload */}
              <div className="relative group">
                <div className="w-40 h-40 rounded-3xl border-[6px] border-white overflow-hidden bg-slate-100 shadow-2xl relative">
                  {user?.image ? (
                    <img 
                      src={user.image} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-300">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                      Salvando...
                    </div>
                  )}
                </div>
                
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  accept="image/*" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl text-slate-900 hover:text-[var(--clara-rose)] transition-all active:scale-90"
                >
                  <FiCamera size={20} />
                </button>
              </div>

              <div className="flex-1 pb-4">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                  {user?.name || "Usuário"}
                  <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full tracking-[0.1em]">
                    ALUNO ATIVO
                    <img src="/static/flower.svg" alt="" className="w-3 h-3 animate-spin-slow" />
                  </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Conta Verificada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
              <section className="space-y-6">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Credenciais</h2>
                
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">E-mail de acesso</p>
                    <p className="text-sm font-bold text-slate-900">{user?.email || "---"}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[var(--clara-rose)]">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Seu Plano</p>
                    <p className="text-sm font-bold text-slate-900">Francês Premium</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Segurança e Acesso</h2>
                <div className="grid grid-cols-1 gap-4">
                  <Link 
                    href="/auth/resetar-senha" 
                    className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[var(--clara-rose)] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <FiLock className="text-slate-400 group-hover:text-[var(--clara-rose)]" size={20} />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600">Alterar Senha</span>
                    </div>
                  </Link>

                  <button className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-slate-900 transition-all group">
                    <div className="flex items-center gap-4">
                      <FiEdit3 className="text-slate-400 group-hover:text-slate-900" size={20} />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600">Editar Dados</span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}