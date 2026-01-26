"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { FaCheck, FaArrowLeft } from "react-icons/fa";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Carregando...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar email de recuperação');
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans bg-white animate-in fade-in duration-700">
      
      <div className="absolute top-0 left-0 w-full h-[45vh] z-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center opacity-30 grayscale-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073')" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white" />
      </div>

      <div className="absolute inset-0 flex pointer-events-none z-10">
        <div className="h-full w-1/3 bg-[#002395] opacity-[0.12]" /> 
        <div className="h-full w-1/3 bg-transparent" />
        <div className="h-full w-1/3 bg-[#ED2939] opacity-[0.12]" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="absolute -bottom-10 -left-10 flex items-end">
          <img src="/static/flower.svg" className="w-56 h-56 opacity-100 -rotate-12 translate-y-10" alt="" />
          <img src="/static/flower.svg" className="w-32 h-32 opacity-100 animate-[spin_80s_linear_infinite] -translate-x-12" alt="" />
        </div>
        <div className="absolute -bottom-10 -right-10 flex items-end">
          <img src="/static/flower.svg" className="w-56 h-56 opacity-100 rotate-12 translate-y-10" alt="" />
          <img src="/static/flower.svg" className="w-32 h-32 opacity-100 animate-[spin_70s_linear_infinite_reverse] -translate-x-8" alt="" />
        </div>
      </div>

      <div className="w-full h-[32vh] relative flex flex-col items-center justify-center z-30">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-slate-900 drop-shadow-sm">
            Recuperar <span className="text-[#002395]">Ace</span><span className="text-[#ED2939]">sso</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-300"></span>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-800">
              Francês com <span className="text-(--clara-rose) italic">Clara</span>
            </p>
            <span className="h-px w-8 bg-slate-300"></span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[480px] px-6 -mt-6 relative z-50">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-slate-50">
            <img src="/static/flower.svg" className="w-10 h-10 animate-[spin_20s_linear_infinite]" alt="Logo" />
          </div>

          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 mb-8">
                <FaCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-black uppercase text-slate-900 mb-4 tracking-tight">Verifique o Terminal!</h2>
              <p className="text-[12px] font-medium text-slate-500 mb-8 uppercase tracking-tighter leading-relaxed">
                Como estamos em teste, o link foi gerado no seu <span className="text-slate-900 font-black">Console do VS Code</span>.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="inline-block w-full h-16 leading-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-(--clara-rose) transition-all shadow-xl"
                >
                  Ir para o Login
                </Link>
                
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-14 border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                >
                  Tentar com outro e-mail
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">Redefinição de Senha</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest leading-relaxed">
                  Enviaremos um link de segurança para o seu e-mail de aluno.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <Input
                  id="email"
                  type="email"
                  label="SEU E-MAIL CADASTRADO"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="h-16 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-(--clara-rose)/20 transition-all placeholder:text-slate-300"
                />

                {error && (
                  <div className="bg-rose-50 border-l-4 border-[#ED2939] text-[#ED2939] text-[10px] font-black p-4 rounded-r-xl uppercase">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 cursor-pointer bg-slate-900 hover:bg-(--clara-rose) text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] transition-all duration-300 shadow-2xl active:scale-[0.98]"
                >
                  {isSubmitting ? 'Enviando Link...' : 'Enviar Instruções'}
                </button>
              </form>
            </>
          )}

          {!isSubmitted && (
            <div className="mt-10 text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-(--clara-rose) transition-colors group"
              >
                <FaArrowLeft className="text-[9px] transition-transform group-hover:-translate-x-1" />
                Voltar ao Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}