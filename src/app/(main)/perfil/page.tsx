"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FiCamera,
  FiUser,
  FiEdit3,
  FiAtSign,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", bio: "" });
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [dbUserData, setDbUserData] = useState<any>(null);

  const levelNames: Record<string, string> = {
    A1: "A1 INICIANTE",
    A2: "A2 BÁSICO",
    B1: "B1 INTERMÉDIAIRE",
    B2: "B2 AVANCÉ",
    C1: "C1 SUPÉRIEUR",
    C2: "C2 MAÎTRISE",
  };

  const fetchFreshProfile = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();

      if (res.ok) {
        setDbUserData(data.profile);

        setFormData({
          name: data.profile.name || "",
          username: data.profile.username || "",
          bio: data.profile.bio || "Estudante apaixonado por Francês! 🇫🇷",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil real:", err);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: "Estudante apaixonado por Francês! 🇫🇷",
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
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROFILE",
          data: {
            name: formData.name,
            username: formData.username,
            bio: formData.bio,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro ao atualizar perfil");

      await update({
        ...session?.user,
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
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
    formData.append("type", "profile");

    setIsUploading(true);
    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        await update({ ...session?.user, image: data.url });
        toast.success("Foto atualizada!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "banner");

    setIsUploading(true);
    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        await update({
          ...session,
          user: {
            ...session?.user,
            banner: data.url,
          },
        });

        setHasChanges(false);
        toast.success("Banner atualizado com sucesso! 🇫🇷");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile");

    setIsUploading(true);
    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.url,
          },
        });

        toast.success("Foto de perfil atualizada!");
      } else {
        throw new Error(data.error || "Erro no upload");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro de conexão");
    } finally {
      setIsUploading(false);
    }
  };

  if (!session || loading) return <Loading />;

  return (
    <main className="min-h-screen bg-(--slate-50) pb-20 animate-in fade-in duration-700">
      <div className="relative h-60 md:h-72 w-full bg-slate-900 group">
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-(--slate-50) z-10" />

        <img
          src={`${user?.banner}?t=${new Date().getTime()}`}
          className="w-full h-full object-cover"
          alt="Banner"
        />

        <input
          type="file"
          ref={bannerInputRef}
          onChange={handleUploadBanner}
          className="hidden"
          accept="image/*"
        />

        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          className="absolute bottom-6 right-6 p-4 z-20
                     bg-white/10 backdrop-blur-md text-white
                     rounded-2xl border border-white/20
                     cursor-pointer
                     transition-all duration-200
                     hover:bg-white/20 hover:scale-105
                     active:scale-95
                     min-w-12 min-h-12
                     flex items-center justify-center
                     shadow-lg"
          title="Alterar banner"
        >
          <FiCamera size={22} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative z-30 -mt-24 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              <div className="w-44 h-44 rounded-[3.5rem] bg-(--slate-50) p-2">
                <div className="w-full h-full rounded-[3rem] bg-white shadow-2xl overflow-hidden flex items-center justify-center border-4 border-white">
                  {user?.image ? (
                    <img
                      src={
                        user?.image
                          ? `${user.image}?t=${new Date().getTime()}`
                          : "/default-avatar.png"
                      }
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      key={user?.image}
                    />
                  ) : (
                    <FiUser size={60} className="text-slate-200" />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-4 right-4 w-11 h-11 bg-(--interface-accent) text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-(--slate-50) hover:scale-110 transition-all cursor-pointer"
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
                <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-(--interface-accent) uppercase tracking-widest shadow-sm">
                  @{formData.username}
                </span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <FiCalendar className="mb-0.5" /> Aluno desde 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-10 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[3rem]">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <FiInfo className="text-(--interface-accent)" /> Informações do
              Perfil
            </h2>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome Público
                  </label>
                  <input
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Username (@)
                  </label>
                  <div className="relative">
                    <FiAtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={formData.username}
                      onChange={(e) => {
                        const val = e.target.value
                          .toLowerCase()
                          .replace(/\s/g, "");
                        setFormData({ ...formData, username: val });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Biografia
                </label>
                <textarea
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-medium text-slate-600 min-h-[150px] focus:ring-2 focus:ring-blue-100 transition-all outline-none leading-relaxed"
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="Conte sua história com a língua francesa..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-none shadow-2xl bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">
                Conquistas
              </h2>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Nível atual
                  </p>
                  <p className="text-3xl font-black text-(--interface-accent) italic">
                    {levelNames[dbUserData?.level || "A1"]}
                  </p>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Lições Concluídas
                  </span>
                  <span className="text-xl font-black">
                    {user?.completedLessonsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Streak (Ofensiva)
                  </span>
                  <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded text-slate-300">
                    Em Breve
                  </span>
                </div>
              </div>
            </div>
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
          setFormData({
            name: user?.name || "",
            username: user?.username || "",
            bio: "Estudante apaixonado por Francês! 🇫🇷",
          });
          setHasChanges(false);
        }}
      />
    </main>
  );
}
