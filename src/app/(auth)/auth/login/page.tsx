"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Turnstile from "react-turnstile";

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Carregando...</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!captchaToken) {
      toast.error("Por favor, complete o desafio de segurança.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn("email", { 
        email, 
        callbackUrl, 
        redirect: false 
      });

      if (result?.error) {
        toast.error("Erro ao enviar o link. Verifique seu e-mail.");
      } else {
        toast.success("Merveilleux! O link de acesso já está no seu e-mail.");
        router.push("/auth/verificar-email");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
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
            Área do <span className="text-[#002395]">Alu</span><span className="text-[#ED2939]">no</span>
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
            <img src="/static/flower.svg" className="w-10 h-10 animate-[spin_20s_linear_infinite]" alt="Logo Clara" />
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">Acesse sua Trilha</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="E-MAIL DE ACESSO"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 font-medium"
            />
            <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1 italic">
              * Enviaremos um link de acesso instantâneo para o seu e-mail.
            </p>

            <div className="flex justify-center py-2">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 cursor-pointer bg-slate-900 hover:bg-(--clara-rose) text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] transition-all duration-300 shadow-2xl active:scale-[0.98]"
            >
              {isSubmitting ? "Enviando seu convite..." : "Receber Link de Acesso"}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-white px-4 tracking-[0.3em]">Ou continuar com</div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-14 cursor-pointer border-2 border-slate-100 bg-white hover:border-(--clara-rose) hover:bg-rose-50/30 rounded-2xl flex items-center justify-center gap-3 transition-all group"
          >
            <FaGoogle className="text-slate-400 group-hover:text-(--clara-rose) transition-colors" size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-(--clara-rose) transition-colors">Google Account</span>
          </button>
        </div>

        <div className="mt-10 mb-16 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Ainda não é aluno? <Link href="/auth/registrar" className="text-(--clara-rose) hover:underline ml-1 font-black">Matricule-se agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}