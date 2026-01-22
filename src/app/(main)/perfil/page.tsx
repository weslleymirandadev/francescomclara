"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiCamera, FiUser, FiEdit3, FiAtSign, FiCalendar, FiInfo } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;

  console.log("DADOS DO USUÁRIO NA SESSÃO:", user);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", bio: "" });
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const levelNames: Record<string, string> = {
    A1: "A1 INICIANTE",
    A2: "A2 BÁSICO",
    B1: "B1 INTERMÉDIAIRE",
    B2: "B2 AVANCÉ",
    C1: "C1 SUPÉRIEUR",
    C2: "C2 MAÎTRISE",
  };

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || "", 
        username: user.username || "",
        bio: "Estudante apaixonado por Francês! 🇫🇷" 
      });
    }
  }, [user]);

  useEffect(() => {
    const syncSession = async () => {
      await update(); 
    };
    syncSession();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      await update({
        ...session?.user,
        name: formData.name,
        username: formData.username,
        bio: formData.bio
      });

      toast.success("Perfil salvo!");
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/user/upload-image", { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      
      if (data.success) {
        await update({ ...session?.user, image: data.imageUrl });
        toast.success("Foto atualizada!");
      }
    } catch (err) {
      toast.error("Erro no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/user/upload-banner", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success) {
        await update({ ...session?.user, banner: data.bannerUrl });
        toast.success("Banner atualizado!");
      }
    } catch (err) {
      toast.error("Erro no upload do banner");
    } finally {
      setIsUploading(false);
    }
  };

  if (!session || loading) return <Loading />;

  return (
    <main className="min-h-screen bg-[var(--color-s-50)] pb-20">
      {/* BANNER DINÂMICO (ESTILO DISCORD) */}
      <div className="relative h-60 md:h-72 w-full bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[var(--color-s-50)]" />
        <img 
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-50"
          alt="Paris Banner"
        />
        <input 
          type="file" 
          ref={bannerInputRef} 
          onChange={handleUploadBanner} 
          className="hidden" 
          accept="image/*" 
        />
        <button 
          className="absolute bottom-6 right-6 p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all border border-white/20"
          onClick={() => bannerInputRef.current?.click()}
        >
          <FiCamera size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative -mt-24 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              <div className="w-44 h-44 rounded-[3.5rem] bg-[var(--color-s-50)] p-2">
                <div className="w-full h-full rounded-[3rem] bg-white shadow-2xl overflow-hidden flex items-center justify-center border-4 border-white">
                  {user?.image ? (
                    <img src={user.image} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser size={60} className="text-slate-200" />
                  )}
                </div>
              </div>
              <button
                type="button" 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-4 right-4 w-11 h-11 bg-[var(--interface-accent)] text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-[var(--color-s-50)] hover:scale-110 transition-all cursor-pointer"
              >
                <FiCamera size={20} />
              </button>
              <input 
                type="file" 
                ref={avatarInputRef}
                onChange={handleUploadImage}
                className="hidden"
                accept="image/*" 
              />
            </div>

            <div className="pb-4">
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {formData.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-[var(--interface-accent)] uppercase tracking-widest shadow-sm">
                  @{formData.username}
                </span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <FiCalendar className="mb-0.5" /> Aluno desde 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-10 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[3rem]">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <FiInfo className="text-[var(--interface-accent)]" /> Informações do Perfil
            </h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Público</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setHasChanges(true); }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (@)</label>
                  <div className="relative">
                    <FiAtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={formData.username}
                      onChange={(e) => { 
                        const val = e.target.value.toLowerCase().replace(/\s/g, "");
                        setFormData({...formData, username: val}); 
                        setHasChanges(true); 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografia</label>
                <textarea 
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-medium text-slate-600 min-h-[150px] focus:ring-2 focus:ring-blue-100 transition-all outline-none leading-relaxed"
                  value={formData.bio}
                  onChange={(e) => { setFormData({...formData, bio: e.target.value}); setHasChanges(true); }}
                  placeholder="Conte sua história com a língua francesa..."
                />
              </div>
            </div>
          </Card>

          {/* CARD LATERAL DE XP */}
          <Card className="p-10 border-none shadow-2xl bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Conquistas</h2>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nível atual</p>
                  <p className="text-3xl font-black text-[var(--interface-accent)] italic">{levelNames[user?.level || "A1"]}</p>
                </div>
                <div className="h-[1px] bg-white/10 w-full" />
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-slate-400">Total de Lições</span>
                   <span className="text-xl font-black">124</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-slate-400">Streak Atual</span>
                   <span className="text-xl font-black text-orange-400">15 Dias 🔥</span>
                </div>
              </div>
            </div>
            {/* Decoração */}
            <div className="absolute -right-10 -bottom-10 text-white/5 rotate-12">
              <FiUser size={250} />
            </div>
          </Card>
        </div>
      </div>

      <SaveChangesBar 
        hasChanges={hasChanges} 
        loading={loading}
        onSave={handleSaveProfile} 
        onDiscard={() => {
          setFormData({ name: user?.name || "", username: user?.username || "", bio: "Estudante apaixonado por Francês! 🇫🇷" });
          setHasChanges(false);
        }} 
      />
    </main>
  );
}