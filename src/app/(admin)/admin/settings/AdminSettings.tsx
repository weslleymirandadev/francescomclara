"use client";

import { useState } from "react";
import { 
  Palette, 
  CreditCard, 
  Lock, 
  Save,
  Bell,
  Globe,
  X,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "./actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { Loading } from "@/components/ui/loading";

interface SettingsFormData {
  siteName: string;
  supportEmail: string;
  stripeMode: boolean;
  maintenanceMode: boolean;
  instagramActive: boolean;
  instagramUrl: string;
  youtubeActive: boolean;
  youtubeUrl: string;
  whatsappActive: boolean;
  whatsappUrl: string;
  tiktokActive: boolean;
  tiktokUrl: string;
  [key: string]: any;
}

export default function AdminSettings({ initialSettings }: { initialSettings: SettingsFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState<SettingsFormData>({
    siteName: initialSettings?.siteName || "Francês com Clara",
    supportEmail: initialSettings?.supportEmail || "contato@clara.fr",
    stripeMode: initialSettings?.stripeMode ?? true,
    maintenanceMode: initialSettings?.maintenanceMode ?? false,
    instagramActive: initialSettings?.instagramActive ?? true,
    instagramUrl: initialSettings?.instagramUrl || "",
    youtubeActive: initialSettings?.youtubeActive ?? true,
    youtubeUrl: initialSettings?.youtubeUrl || "",
    whatsappActive: initialSettings?.whatsappActive ?? true,
    whatsappUrl: initialSettings?.whatsappUrl || "",
    tiktokActive: initialSettings?.tiktokActive ?? false,
    tiktokUrl: initialSettings?.tiktokUrl || "",
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleDiscard = () => {
    setFormData({ ...initialSettings });
    setHasChanges(false);
    router.refresh();
    toast.success("Alterações descartadas");
  };

  async function handleSave() {
    setLoading(true);
    const res = await updateSettings(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Configurações aplicadas! 🌸");
      setHasChanges(false);
      router.refresh();
    } else {
      toast.error("Erro ao salvar no banco de dados.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="w-full bg-white min-h-screen pb-32">
      <SaveChangesBar 
        hasChanges={hasChanges}
        loading={loading}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saveText="Enregistrer"
      />

      <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-frenchpress text-[var(--interface-accent)] uppercase tracking-tighter">
              Paramètres 🌸
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Configure a identidade e as integrações da plataforma
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[var(--clara-rose)]">
                  <Palette size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Identidade Visual</h2>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* CONSTRUTOR DE NOME */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto Base</label>
                    <Input 
                      value={formData.siteNameFirstPart}
                      onChange={e => handleChange("siteNameFirstPart", e.target.value)}
                      placeholder="Francês com"
                      className="h-12 rounded-xl bg-white border-none font-bold text-slate-700 shadow-sm" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destaque</label>
                    <Input 
                      value={formData.siteNameHighlight}
                      onChange={e => handleChange("siteNameHighlight", e.target.value)}
                      placeholder="Clara"
                      style={{ color: `var(${formData.highlightColor || '--clara-rose'})` }}
                      className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emoji / Detalhe</label>
                    <Input 
                      value={formData.siteIcon}
                      onChange={e => handleChange("siteIcon", e.target.value)}
                      placeholder="🌸"
                      className="h-12 rounded-xl bg-white border-none font-bold text-center text-lg shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ícone de Interface (Bandeira)</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                        <img src={formData.interfaceIcon} alt="Preview" className="w-6 object-contain" />
                      </div>
                      <Input 
                        value={formData.interfaceIcon}
                        onChange={e => handleChange("interfaceIcon", e.target.value)}
                        placeholder="/static/frança.png"
                        className="h-12 rounded-xl bg-slate-50 border-none font-medium text-slate-600 flex-1" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* E-MAIL DE SUPORTE */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Suporte</label>
                    <Input 
                      value={formData.supportEmail}
                      onChange={e => handleChange("supportEmail", e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700" 
                    />
                  </div>

                  {/* SELETOR DE COR DINÂMICO */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor de Destaque</label>
                    <div className="flex gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl border-4 border-white shadow-sm overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: formData.highlightColor || '#D44D8C' }}
                      >
                        <input 
                          type="color" 
                          value={formData.highlightColor || '#D44D8C'}
                          onChange={e => handleChange("highlightColor", e.target.value)}
                          className="w-full h-full cursor-pointer opacity-0"
                        />
                      </div>
                      <Input 
                        value={formData.highlightColor}
                        readOnly
                        className="h-12 rounded-xl bg-slate-50 border-none font-mono text-xs text-slate-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                <Globe className="text-blue-500" size={24} />
                <h2 className="text-xl font-frenchpress text-slate-800 uppercase tracking-tight">Redes Sociais & Links</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/seu-perfil" },
                  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/seu-canal" },
                  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/55..." },
                  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@seu-user" },
                ].map((social) => {
                  const activeKey = `${social.key}Active`;
                  const urlKey = `${social.key}Url`;

                  return (
                    <div key={social.key} className="space-y-3 p-4 rounded-2xl bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{social.label}</span>
                        <Switch 
                          checked={formData[activeKey]} 
                          onCheckedChange={(v) => handleChange(activeKey, v)}
                        />
                      </div>
                      <div className={formData[activeKey] ? "opacity-100" : "opacity-40 pointer-events-none"}>
                        <Input 
                          value={formData[urlKey]}
                          placeholder={social.placeholder}
                          onChange={(e) => handleChange(urlKey, e.target.value)}
                          className="h-10 rounded-xl bg-white text-xs border-slate-200"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <section className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-lg font-frenchpress text-slate-800 uppercase tracking-tight">Pagamentos</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Modo Produção</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Stripe Gateway</p>
                  </div>
                  <Switch 
                    checked={formData.stripeMode}
                    onCheckedChange={v => handleChange("stripeMode", v)}
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Modo Manutenção</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Plataforma Offline</p>
                  </div>
                  <Switch 
                    checked={formData.maintenanceMode}
                    onCheckedChange={v => handleChange("maintenanceMode", v)}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={18} className="text-slate-400" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notificações</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Novos Alunos", key: "notifyNewUsers" },
                  { label: "Pagamentos", key: "notifyPayments" },
                  { label: "Acessos", key: "notifyAccess" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between group">
                    <p className="text-xs font-bold text-slate-700">{item.label}</p>
                    <Switch 
                      checked={formData[item.key]} 
                      onCheckedChange={(val) => {
                        setFormData({ ...formData, [item.key]: val });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white group cursor-pointer hover:bg-black transition-all relative overflow-hidden">
              <div className="relative z-10">
                <Globe size={24} className="mb-4 text-emerald-400" />
                <h3 className="text-xl font-black uppercase tracking-tighter">API & Integrações</h3>
                <p className="text-[10px] text-slate-400 font-medium mb-4 italic text-balance">
                  Configure Stripe, SMTP e chaves externas
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <Button variant="link" className="text-white p-0 h-auto font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-transform">
                    Configurar Stripe →
                  </Button>
                  <Button variant="link" className="text-white p-0 h-auto font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-transform text-slate-400">
                    Servidor de E-mail (SMTP) →
                  </Button>
                </div>
              </div>
              <Globe size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}