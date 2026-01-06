"use client";

import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  Download,
  Target,
  ArrowRight
} from "lucide-react";

const analyticsMock = {
  mrr: "R$ 8.920,00",
  churn: "2.4%",
  ltv: "R$ 1.240,00",
  newSales: [
    { id: '1', date: '05 Jan', value: 'R$ 499,00', type: 'Anual' },
    { id: '2', date: '04 Jan', value: 'R$ 89,90', type: 'Mensal' },
    { id: '3', date: '04 Jan', value: 'R$ 149,00', type: 'Família' },
  ]
};

export default function AdminAnalytics() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Compacto */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-frenchpress text-s-800 uppercase tracking-tighter">Analytiques</h1>
          <p className="text-s-600 text-sm font-bold italic">Saúde financeira 🌸</p>
        </div>
        <button className="bg-s-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-interface-accent transition-all shadow-md">
          <Download size={16} /> Exportar
        </button>
      </header>

      {/* Grid de Métricas Enxutas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card MRR */}
        <div className="bg-white border border-s-100 rounded-3xl p-6 shadow-sm hover:border-interface-accent/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-interface-accent rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="text-emerald-600 font-black text-[10px] flex items-center bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight size={12} /> +12%
            </span>
          </div>
          <p className="text-[10px] font-black text-s-400 uppercase tracking-widest">Faturamento Mensal</p>
          <h2 className="text-2xl font-black text-s-900 leading-tight">{analyticsMock.mrr}</h2>
        </div>

        {/* Card Churn */}
        <div className="bg-white border border-s-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
              <Target size={20} />
            </div>
            <span className="text-[10px] font-bold text-s-400 italic">Meta: &lt; 3%</span>
          </div>
          <p className="text-[10px] font-black text-s-400 uppercase tracking-widest">Cancelamentos</p>
          <h2 className="text-2xl font-black text-s-900">{analyticsMock.churn}</h2>
        </div>

        {/* Card LTV */}
        <div className="relative overflow-hidden bg-white border border-s-100 rounded-3xl p-6 shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-s-50 text-s-800 rounded-lg group-hover:bg-interface-accent group-hover:text-white transition-colors">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[10px] font-black text-s-400 uppercase tracking-widest">Lifetime Value</p>
          <h2 className="text-2xl font-black text-s-900">{analyticsMock.ltv}</h2>
          
          {/* Sutil detalhe da bandeira no fundo */}
          <div className="absolute top-0 right-0 w-1 h-full flex flex-col opacity-20 group-hover:opacity-100 transition-opacity">
            <div className="flex-1 bg-blue-600" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-red-600" />
          </div>
        </div>
      </div>

      {/* Histórico de Vendas - Lista Enxuta */}
      <div className="bg-white border border-s-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-s-50 flex justify-between items-center">
          <h3 className="text-lg font-frenchpress text-s-800 uppercase">Flux de Trésorerie</h3>
          <span className="text-[10px] font-black text-s-400 uppercase tracking-widest">Últimos 7 dias</span>
        </div>
        <div className="divide-y divide-s-50">
          {analyticsMock.newSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 px-6 hover:bg-s-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-s-50 border border-s-100 rounded-xl flex items-center justify-center font-black text-s-800 text-xs">
                  {sale.date.split(' ')[0]}
                </div>
                <div>
                  <p className="font-bold text-s-800 text-sm leading-none mb-1">{sale.type}</p>
                  <p className="text-[11px] text-s-400 font-medium tracking-tight uppercase">{sale.date}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="font-black text-s-900 text-sm">{sale.value}</p>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter text-right">Confirmado</p>
                </div>
                <ArrowRight size={16} className="text-s-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}