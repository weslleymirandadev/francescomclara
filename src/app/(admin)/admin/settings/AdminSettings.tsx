"use client";

import { useState } from "react";
import { 
  Palette, 
  CreditCard,
  Bell,
  Globe,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "./actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SaveChangesBar } from "@/components/ui/savechangesbar";
import { Loading } from "@/components/ui/loading";
import { ImageUpload } from "./components/imageUpload";

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
    siteDescription: initialSettings?.siteDescription || "Transformando sua jornada no idioma francês com método prático, contexto cultural e tecnologia.",
    seoDescription: initialSettings?.seoDescription || "Aprenda francês de forma prática e cultural com a Clara.",
    siteNameFirstPart: initialSettings?.siteNameFirstPart || "Francês com",
    siteNameHighlight: initialSettings?.siteNameHighlight || "Clara",
    siteIcon: initialSettings?.siteIcon || "/static/flower.svg",
    highlightColor: initialSettings?.highlightColor || "--clara-rose",
    interfaceIcon: initialSettings?.interfaceIcon || "/static/franca.png",
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
    daysToNotifyExpiring: initialSettings?.daysToNotifyExpiring ?? 7,
    inactivityDays: initialSettings?.inactivityDays ?? 7,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev,
      [field]: value 
    }));
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
    try {
      const res = await updateSettings(formData);
      if (res.success) {
        toast.success("Configurações aplicadas!", {
          icon: (
            <img 
              src="/static/flower.svg" 
              className="w-5 h-5 object-contain" 
              alt="/static/flower.svg" 
            />
          ),
        });
        setHasChanges(false);
        router.refresh();
      } else {
        toast.error("Erro ao salvar no banco de dados.");
      }
    } finally {
      setLoading(false);
    }
  }

  const resetColor = () => {
    handleChange("highlightColor", "--clara-rose");
    toast.success("Cor original restaurada!", {
      icon: (
        <img 
          src="/static/flower.svg" 
          className="w-5 h-5 object-contain" 
          alt="/static/flower.svg" 
        />
      ),
    });
  };

  const resetIcon = () => {
    handleChange("interfaceIcon", "/static/franca.png");
    toast.success("Bandeira original restaurada! 🚩");
  };

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
            <h1 className="flex gap-1 text-4xl md:text-5xl font-bold font-frenchpress text-[var(--interface-accent)] uppercase tracking-tighter">
              Paramètres 
              <img src="/static/flower.svg" alt="Flor" className="w-8 h-8 object-contain pointer-events-none" />
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Configure a identidade e as integrações da plataforma
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-pink-50 rounded-2xl text-[var(--clara-rose)]">
                  <Palette size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Identidade Visual</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo, Favicon e Cores</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <ImageUpload 
                  label="Ícone do Site (A Flor)"
                  field="siteIcon"
                  value={formData.siteIcon}
                  onChange={handleChange}
                  maxDimension={512}
                />

                <ImageUpload 
                  label="Favicon (Aba)"
                  field="favicon"
                  value={formData.favicon || "/static/favicon.svg"}
                  onChange={handleChange}
                  maxDimension={64}
                />
              </div>

              <div className="grid grid-cols-1 gap-8">
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

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ícone de Interface</label>
                      <button 
                        onClick={resetIcon}
                        className="text-[9px] font-bold text-blue-400 uppercase hover:underline cursor-pointer"
                      >
                        Original
                      </button>
                    </div>
                    <div 
                      className="group relative h-12 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center px-4 gap-4 hover:border-blue-400 transition-all cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <img 
                        src={formData.interfaceIcon} 
                        alt="Preview" 
                        className="w-6 h-4 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/static/franca.png' }}
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Clique para alterar ícone</span>
                      <input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange("interfaceIcon", `/static/${file.name}`);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Descrição do Rodapé
                      </label>
                      <button 
                        type="button"
                        onClick={() => handleChange("siteDescription", "Transformando sua jornada no idioma francês com método prático, contexto cultural e tecnologia.")}
                        className="text-[9px] font-bold text-rose-400 uppercase hover:underline"
                      >
                        Original
                      </button>
                    </div>
                    <textarea 
                      value={formData.siteDescription}
                      onChange={e => handleChange("siteDescription", e.target.value)}
                      className="w-full min-h-[80px] p-4 rounded-xl bg-slate-50 border-none font-medium text-slate-600 text-sm resize-none focus:ring-2 focus:ring-rose-100 transition-all outline-none"
                      placeholder="Texto que aparece abaixo da logo no rodapé..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        SEO Description (Google)
                      </label>
                      <button 
                        type="button"
                        onClick={() => handleChange("seoDescription", "Aprenda francês de forma prática e cultural com a Clara.")}
                        className="text-[9px] font-bold text-rose-400 uppercase hover:underline"
                      >
                        Original
                      </button>
                    </div>
                    <Input 
                      value={formData.seoDescription}
                      onChange={e => handleChange("seoDescription", e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-none font-medium text-slate-600 text-sm"
                      placeholder="Descrição para motores de busca..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Suporte</label>
                    <Input 
                      value={formData.supportEmail}
                      onChange={e => handleChange("supportEmail", e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor de Destaque</label>
                      <button 
                        type="button"
                        onClick={resetColor}
                        className="text-[9px] font-bold text-rose-400 uppercase hover:underline cursor-pointer"
                      >
                        Original
                      </button>
                    </div>
                    <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div 
                        className="w-12 h-12 rounded-xl border-4 border-white shadow-sm relative flex-shrink-0"
                        style={{ backgroundColor: formData.highlightColor?.startsWith('--') ? `var(${formData.highlightColor})` : (formData.highlightColor || '#D44D8C') }}
                      >
                        <input 
                          type="color" 
                          value={formData.highlightColor?.startsWith('--') ? '#D44D8C' : (formData.highlightColor || '#D44D8C')}
                          onChange={e => handleChange("highlightColor", e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={formData.highlightColor || ""}
                        onChange={e => handleChange("highlightColor", e.target.value)}
                        className="h-12 border-none bg-transparent font-mono text-xs" 
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
                    <p className="text-[9px] text-slate-400 uppercase font-black">Mercado Pago</p>
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

            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-[var(--interface-accent)] rounded-2xl flex items-center justify-center">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Fluxos de Engajamento</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-balance">
                    Configure como e quando o sistema deve falar com seus alunos
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Automação 01: Expiração de Plano */}
                <div className="group border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:border-slate-200">
                  <div className="p-6 flex flex-col md:flex-row gap-6 bg-slate-50/50">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">Aviso de Vencimento</span>
                        </div>
                        <Switch 
                          checked={formData.notifyPlanExpiring} 
                          onCheckedChange={(val) => { setFormData({...formData, notifyPlanExpiring: val}); setHasChanges(true); }}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Avisar o aluno</span>
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2">
                          <input 
                            type="number"
                            value={formData.daysToNotifyExpiring} 
                            onChange={(e) => { 
                              setFormData({ ...formData, daysToNotifyExpiring: parseInt(e.target.value)}); setHasChanges(true); }}
                            className="w-16 h-8 text-center font-bold text-xs border-none focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">dias antes do plano acabar</span>
                      </div>

                      <textarea 
                        value={formData.expiringMessage}
                        onChange={(e) => { setFormData({...formData, expiringMessage: e.target.value}); setHasChanges(true); }}
                        className="w-full min-h-[80px] p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-600 outline-none focus:ring-1 focus:ring-interface-accent transition-all resize-none"
                        placeholder="Sua mensagem de renovação..."
                      />
                    </div>
                  </div>
                </div>

                {/* Automação 02: Inatividade */}
                <div className="group border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:border-slate-200">
                  <div className="p-6 flex flex-col md:flex-row gap-6 bg-slate-50/50">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">Alerta de Inatividade</span>
                        </div>
                        <Switch 
                          checked={formData.notifyInactivity} 
                          onCheckedChange={(val) => { setFormData({...formData, notifyInactivity: val}); setHasChanges(true); }}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Se o aluno não logar por</span>
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2">
                          <input 
                            type="number"
                            value={formData.inactivityDays}
                            onChange={(e) => { setFormData({...formData, inactivityDays: parseInt(e.target.value)}); setHasChanges(true); }}
                            className="w-10 h-8 text-center text-xs font-bold bg-transparent outline-none"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">dias, enviar mensagem</span>
                      </div>

                      <textarea 
                        value={formData.inactivityMessage}
                        onChange={(e) => { setFormData({...formData, inactivityMessage: e.target.value}); setHasChanges(true); }}
                        className="w-full min-h-[80px] p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-600 outline-none focus:ring-1 focus:ring-interface-accent transition-all resize-none"
                        placeholder="Mensagem de saudade..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}