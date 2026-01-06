"use client";

import { motion } from "framer-motion";
import { FiSave, FiUser } from "react-icons/fi";

export function SettingsForm() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 border border-[var(--color-s-200)] shadow-sm space-y-8"
    >
      {/* Seção de Perfil */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-s-100)]">
          <div className="w-12 h-12 bg-pink-50 text-[var(--clara-rose)] rounded-2xl flex items-center justify-center">
            <FiUser size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-s-800)]">Dados Pessoais</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--color-s-400)] ml-1">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Seu nome"
              className="w-full px-4 py-3 bg-[var(--color-s-50)] border border-[var(--color-s-200)] rounded-xl focus:ring-2 focus:ring-[var(--interface-accent)] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--color-s-400)] ml-1">E-mail</label>
            <input 
              type="email" 
              disabled
              value="estudante@exemplo.com"
              className="w-full px-4 py-3 bg-[var(--color-s-100)] border border-[var(--color-s-200)] rounded-xl text-[var(--color-s-50)]0 cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* Botão de Salvar */}
      <div className="pt-4">
        <button className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-[var(--interface-accent)] text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all">
          <FiSave size={18} />
          Salvar Alterações
        </button>
      </div>
    </motion.div>
  );
}