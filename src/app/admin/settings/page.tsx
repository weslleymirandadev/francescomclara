"use client";

import { 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  CreditCard, 
  Save,
  Palette
} from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-frenchpress text-s-800">Paramètres</h1>
          <p className="text-s-600 font-bold italic">Configure as preferências do sistema e da marca 🌸</p>
        </div>
        <button className="bg-interface-accent text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-s-900 transition-all flex items-center gap-2">
          <Save size={20} /> Salvar Alterações
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Seção: Identidade Visual */}
        <section className="bg-white border-2 border-s-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-s-50 pb-4">
            <Palette className="text-interface-accent" size={24} />
            <h2 className="text-xl font-frenchpress text-s-800">Identidade & Marca</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-s-700 uppercase tracking-widest">Nome da Plataforma</label>
              <input type="text" defaultValue="Francês com Clara" className="w-full p-4 bg-s-50 border-2 border-s-50 rounded-xl font-bold text-s-800 outline-none focus:border-interface-accent transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-s-700 uppercase tracking-widest">E-mail de Suporte</label>
              <input type="email" defaultValue="contato@clara.fr" className="w-full p-4 bg-s-50 border-2 border-s-50 rounded-xl font-bold text-s-800 outline-none focus:border-interface-accent transition-all" />
            </div>
          </div>
        </section>

        {/* Seção: Pagamentos & Taxas */}
        <section className="bg-white border-2 border-s-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-s-50 pb-4">
            <CreditCard className="text-clara-rose" size={24} />
            <h2 className="text-xl font-frenchpress text-s-800">Assinaturas & Checkout</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-s-50 rounded-2xl">
              <div>
                <p className="font-bold text-s-800">Modo de Teste (Stripe)</p>
                <p className="text-xs text-s-500 font-medium">As transações não serão reais</p>
              </div>
              <div className="w-12 h-6 bg-s-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-s-700 uppercase tracking-widest">Moeda</label>
                <select className="w-full p-4 bg-s-100 border-none rounded-xl font-bold text-s-800 outline-none">
                  <option>BRL (R$)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Segurança */}
        <section className="bg-white border-2 border-s-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-s-50 pb-4">
            <Lock className="text-s-700" size={24} />
            <h2 className="text-xl font-frenchpress text-s-800">Segurança do Painel</h2>
          </div>

          <button className="text-s-700 font-bold flex items-center gap-2 hover:text-interface-accent transition-colors">
            Alterar senha do administrador →
          </button>
        </section>

      </div>
    </div>
  );
}