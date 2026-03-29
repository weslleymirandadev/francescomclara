import Link from "next/link";
import { ArrowLeft, Ghost } from "lucide-react";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="relative bg-slate-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-slate-900 shadow-inner border border-slate-100">
            {/* O Ghost com uma animação de flutuação suave */}
            <Ghost size={64} strokeWidth={1.5} className="opacity-20 animate-bounce" style={{ animationDuration: '5s' }} />
            <span className="absolute font-black text-4xl italic tracking-tighter">404</span>
        </div>
      </div>

      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4">
        Opa! Página não encontrada
      </h2>
      
      <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-8 max-w-2xl">
        Parece que você se perdeu no caminho.
      </h1>

      <p className="text-slate-500 font-medium max-w-md mb-12 leading-relaxed">
        A página que você está procurando não existe ou foi movida para uma nova trilha de aprendizado.
      </p>

      <Link href="/">
        <button className="group flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 h-16 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Voltar ao Início
        </button>
      </Link>

      <footer className="mt-20 opacity-30">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Francês com Clara
        </p>
      </footer>
    </div>
  );
}