"use client";

import { Suspense } from "react";
import Link from "next/link";
import { FaEnvelopeOpenText } from "react-icons/fa";

function VerifyRequestContent() {
  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans bg-white animate-in fade-in duration-700">
      
      <div className="absolute top-0 left-0 w-full h-[45vh] z-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center opacity-20 grayscale-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073')" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white" />
      </div>

      <div className="w-full h-[35vh] relative flex flex-col items-center justify-center z-30">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-slate-900">
            Quase <span className="text-[#002395]">Lá</span><span className="text-[#ED2939]">!</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-300"></span>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-800">
              Vérifiez sua <span className="text-(--clara-rose) italic">Boîte de Réception</span>
            </p>
            <span className="h-px w-8 bg-slate-300"></span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[500px] px-6 relative z-50 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative">
          
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-rose-50 rounded-full text-(--clara-rose) animate-bounce">
              <FaEnvelopeOpenText size={48} />
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">
            Link Enviado!
          </h2>
          
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            Enviamos um link mágico para o seu e-mail. <br />
            Basta clicar nele para entrar na sua conta instantaneamente, sem precisar de senha.
          </p>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Não recebeu? Verifique sua pasta de spam.
            </p>
            
            <Link 
              href="/auth/login"
              className="inline-block w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-(--clara-rose) transition-all duration-300"
            >
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyRequest() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Carregando...</div>}>
      <VerifyRequestContent />
    </Suspense>
  );
}