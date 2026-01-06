"use client";

import { Users, Search, Filter, MoreHorizontal, Mail, Calendar } from "lucide-react";

const usersMock = [
  { id: '1', name: 'Jean Dupont', email: 'jean.dupont@email.com', plan: 'Pro Anual', status: 'Ativo', date: '12/05/2025' },
  { id: '2', name: 'Marie Claire', email: 'marie@claire.fr', plan: 'Individual Mensal', status: 'Ativo', date: '02/06/2025' },
  { id: '3', name: 'Lucas Silva', email: 'lucas@brasil.com', plan: 'Plano Família', status: 'Inadimplente', date: '15/05/2025' },
  { id: '4', name: 'Sophie Martin', email: 'sophie.m@luxe.com', plan: 'Pro Anual', status: 'Ativo', date: '20/05/2025' },
];

export default function AdminUsers() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Compacto */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-frenchpress text-s-800 uppercase tracking-tighter">Gestion des Étudiants</h1>
          <p className="text-s-600 text-sm font-bold italic">Administre seus alunos 🌸</p>
        </div>
      </header>

      {/* Barra de Busca Enxuta */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-s-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-s-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar aluno..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-s-50 border border-transparent focus:border-interface-accent/30 outline-none text-sm font-medium text-s-800 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-s-900 text-white text-xs font-bold rounded-xl hover:bg-interface-accent transition-all">
          <Filter size={14} />
          Filtrar
        </button>
      </div>

      {/* Tabela Ultra-Enxuta */}
      <div className="bg-white border border-s-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-s-50/50 border-b border-s-50">
              <th className="px-6 py-4 text-[10px] font-black text-s-500 uppercase tracking-widest">Estudante</th>
              <th className="px-6 py-4 text-[10px] font-black text-s-500 uppercase tracking-widest text-center">Plano</th>
              <th className="px-6 py-4 text-[10px] font-black text-s-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-s-500 uppercase tracking-widest text-right">Inscrição</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-s-50">
            {usersMock.map((user) => (
              <tr key={user.id} className="hover:bg-s-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-s-100 flex items-center justify-center font-black text-interface-accent text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-s-800 text-sm leading-none mb-1">{user.name}</div>
                      <div className="text-s-400 text-[11px] font-medium flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-tight border border-blue-100/50">
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${
                    user.status === 'Ativo' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {user.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-s-700 font-bold text-xs">{user.date}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-s-300 hover:text-s-800 transition-colors rounded-lg hover:bg-white">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}