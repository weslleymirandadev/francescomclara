"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/perfil";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos os campos são obrigatórios");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setIsSubmitting(false);
      return;
    }

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.error || 'Erro ao criar conta');
        setIsSubmitting(false);
        return;
      }

      const loginUrl = `/auth/login?message=${encodeURIComponent('Conta criada com sucesso!')}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      router.push(loginUrl);
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      <div className="w-full h-[28vh] relative flex flex-col items-center justify-center z-30">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-slate-900">
            Criar <span className="text-[#002395]">Con</span><span className="text-[#ED2939]">ta</span>
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

      <div className="w-full max-w-[520px] px-6 -mt-4 relative z-50">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-slate-50">
            <img src="/static/flower.svg" className="w-10 h-10 animate-[spin_20s_linear_infinite]" alt="Logo" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="name"
              name="name"
              type="text"
              label="NOME COMPLETO"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Como deseja ser chamado?"
              className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
            />
            
            <Input
              id="email"
              name="email"
              type="email"
              label="E-MAIL DE ACESSO"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="h-14 rounded-2xl bg-white border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="password"
                name="password"
                type="password"
                label="SENHA"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                className="h-14 rounded-2xl bg-white border-slate-200"
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="CONFIRMAR"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                className="h-14 rounded-2xl bg-white border-slate-200"
              />
            </div>
            
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
              {isSubmitting ? 'Preparando Trilha...' : 'Criar Minha Conta'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-white px-4 tracking-[0.3em]">Ou</div>
          </div>

          <button
            type="button"
            className="w-full h-14 cursor-pointer border-2 border-slate-100 bg-white hover:border-(--clara-rose) hover:bg-rose-50/30 rounded-2xl flex items-center justify-center gap-3 transition-all group"
          >
            <FaGoogle className="text-slate-400 group-hover:text-(--clara-rose) transition-colors" size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-(--clara-rose) transition-colors">Registrar com Google</span>
          </button>
        </div>

        <div className="mt-8 mb-12 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Já tem uma conta?{" "}
            <Link 
              href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="text-(--clara-rose) hover:underline ml-1 font-black"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}