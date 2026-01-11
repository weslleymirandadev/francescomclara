"use client";

import { useState } from "react";
import { 
  Palette, 
  CreditCard, 
  Lock, 
  Save,
  Bell,
  Globe,
  Mail,
  Smartphone,
  Check
} from "lucide-react";
import { FaInstagram, FaWhatsapp, FaYoutube} from 'react-icons/fa'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "./actions"
import { toast } from "react-hot-toast"

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
  [key: string]: any;
}

export default function AdminSettings({ initialSettings }: { initialSettings: SettingsFormData }) {
  const [loading, setLoading] = useState(false);
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
  });

  async function handleSave() {
    setLoading(true)
    const res = await updateSettings(formData)
    setLoading(false)

    if (res.success) {
      toast.success("Configurações atualizadas! 🌸")
    } else {
      toast.error("Erro ao salvar.")
    }
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-frenchpress text-[var(--interface-accent)] uppercase tracking-tighter">
              Paramètres 🌸
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Personnalisation et configuration globale
            </p>
          </div>
          
          <Button 
            className="bg-slate-900 text-white rounded-2xl h-12 px-8 font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all w-full md:w-auto"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Enregistrer"}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            
            <section className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[var(--interface-accent)]">
                  <Palette size={20} />
                </div>
                <h2 className="text-xl font-frenchpress text-slate-800 uppercase tracking-tight">Identidade Visual</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Escola</label>
                  <Input 
                    value={formData.siteName}
                    onChange={e => setFormData({...formData, siteName: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor Principal</label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.supportEmail}
                      onChange={e => setFormData({...formData, supportEmail: e.target.value})}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700" 
                    />
                    <div className="w-12 h-12 rounded-xl bg-[var(--interface-accent)] shrink-0 shadow-inner" />
                  </div>
                </div>
              </div>
            </section>

            {/* Secção Contactos */}
            <section className="bg-white border-2 border-s-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-s-50 pb-4">
                <Globe className="text-blue-500" size={24} />
                <h2 className="text-xl font-frenchpress text-s-800 uppercase tracking-tight">Redes Sociais & Links</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { key: "instagram", label: "Instagram" },
                  { key: "youtube", label: "YouTube" },
                  { key: "whatsapp", label: "WhatsApp" },
                ].map((social) => {
                  // Criamos as chaves aqui para facilitar a leitura do TS
                  const activeKey = `${social.key}Active`;
                  const urlKey = `${social.key}Url`;

                  return (
                    <div key={social.key} className="space-y-3 p-4 rounded-2xl bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{social.label}</span>
                        <Switch 
                          checked={formData[activeKey]} 
                          onCheckedChange={(v) => setFormData({ ...formData, [activeKey]: v })}
                        />
                      </div>
                      
                      <div className={formData[activeKey] ? "opacity-100" : "opacity-40 pointer-events-none"}>
                        <Input 
                          value={formData[urlKey]}
                          onChange={(e) => setFormData({ ...formData, [urlKey]: e.target.value })}
                          className="h-10 rounded-xl bg-white text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Coluna Direita: Pagamentos e Sistema (5 colunas no PC) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Secção Stripe/Pagamentos */}
            <section className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-lg font-frenchpress text-slate-800 uppercase tracking-tight">Pagamentos</h2>
                </div>
                <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" title="Stripe Conectado" />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Modo Produção</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Stripe Gateway</p>
                  </div>
                  <Switch 
                    checked={formData.stripeMode}
                    onCheckedChange={v => setFormData({...formData, stripeMode: v})}
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Moeda Padrão</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">BRL - Real Brasileiro</p>
                  </div>
                  <Switch 
                    checked={formData.maintenanceMode}
                    onCheckedChange={v => setFormData({...formData, maintenanceMode: v})}
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
                  { label: "Novos Alunos", desc: "Avisar no e-mail" },
                  { label: "Pagamentos", desc: "Alertas de falha" },
                  { label: "Acessos", desc: "Logins suspeitos" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-slate-700 group-hover:text-[var(--interface-accent)] transition-colors">{item.label}</p>
                      <p className="text-[9px] text-slate-400">{item.desc}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white group cursor-pointer hover:bg-black transition-all relative overflow-hidden">
               <div className="relative z-10">
                 <Lock size={24} className="mb-4 text-rose-400" />
                 <h3 className="text-xl font-frenchpress uppercase">Segurança</h3>
                 <p className="text-[10px] text-slate-400 font-medium mb-4 italic">Última alteração há 2 meses</p>
                 <Button variant="link" className="text-white p-0 h-auto font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   Alterar Senha →
                 </Button>
               </div>
               <Lock size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 group-hover:rotate-0 transition-all duration-700" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}