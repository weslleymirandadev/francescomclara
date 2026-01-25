"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type SignInFormData = z.infer<typeof signInSchema>;

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
  const callbackUrl = searchParams.get("callbackUrl") ?? "/minha-trilha";
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setFormError("E-mail ou senha incorretos.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setFormError("Erro ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans bg-white">
      
      {/* --- BACKGROUND TRICOLOR INTEGRADO --- */}
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

      {/* JARDIM DE FLORES NO RODAPÉ */}
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

      {/* BANNER CONTENT */}
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

      {/* CARD DE LOGIN */}
      <div className="w-full max-w-[480px] px-6 -mt-6 relative z-50">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative">
          
          {/* Flor Ícone no Topo do Card */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-slate-50">
            <img src="/static/flower.svg" className="w-10 h-10 animate-[spin_20s_linear_infinite]" alt="Logo Clara" />
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">Acesse sua Trilha</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <Input
              label="SEU E-MAIL"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="exemplo@email.com"
              className="h-16 rounded-2xl border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
            />

            <div className="space-y-1">
              <Input
                label="SUA SENHA"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder="••••••••"
                className="h-16 rounded-2xl border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
              />
              <div className="flex justify-end pr-1">
                <Link href="/auth/esqueci-a-senha" className="text-[10px] font-black uppercase text-slate-500 hover:text-(--clara-rose) transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 cursor-pointer bg-slate-900 hover:bg-(--clara-rose) text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] transition-all duration-300 shadow-2xl shadow-slate-300 active:scale-[0.98]"
            >
              {isSubmitting ? "Carregando..." : "Entrar na Trilha"}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-white px-4 tracking-[0.3em]">Ou continuar com</div>
          </div>

          {/* BOTÃO DO GOOGLE COM HOVER ROSA SOLICITADO */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/minha-trilha" })}
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