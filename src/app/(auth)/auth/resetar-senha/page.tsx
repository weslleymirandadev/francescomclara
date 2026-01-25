"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FaCheck, FaTimes } from "react-icons/fa";

export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validateToken = searchParams.get('validate');
  
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!validateToken) {
        setIsValidating(false);
        setIsValid(false);
        setError('Token não fornecido');
        return;
      }

      setToken(validateToken);

      try {
        const encodedToken = encodeURIComponent(validateToken);
        const response = await fetch(`/api/auth/reset-password?token=${encodedToken}`);
        const data = await response.json();

        if (data.valid) {
          setIsValid(true);
          setEmail(data.email || '');
        } else {
          setIsValid(false);
          setError(data.error || 'Token inválido ou expirado');
        }
      } catch (err) {
        setIsValid(false);
        setError('Erro ao validar token');
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [validateToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('Mínimo de 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login?message=Senha redefinida com sucesso');
      }, 2000);
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
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

      {/* TÍTULO DA PÁGINA */}
      <div className="w-full h-[32vh] relative flex flex-col items-center justify-center z-30">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-slate-900 drop-shadow-sm">
            Recuperar <span className="text-[#002395]">Sen</span><span className="text-[#ED2939]">ha</span>
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

      {/* CARD DE CONTEÚDO */}
      <div className="w-full max-w-[480px] px-6 -mt-6 relative z-50">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-slate-50">
            <img src="/static/flower.svg" className="w-10 h-10 animate-[spin_20s_linear_infinite]" alt="Logo" />
          </div>

          {isValidating ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-6 text-[11px] font-black uppercase tracking-widest text-slate-500">Validando Token...</p>
            </div>
          ) : !isValid ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 mb-6">
                <FaTimes className="h-6 w-6 text-[#ED2939]" />
              </div>
              <h2 className="text-lg font-black uppercase text-slate-900 mb-2">Link Inválido</h2>
              <p className="text-[11px] font-medium text-slate-500 mb-8 uppercase tracking-tighter leading-relaxed">
                {error || 'O link de redefinição de senha expirou ou já foi utilizado.'}
              </p>
              <Link
                href="/auth/esqueci-a-senha"
                className="inline-block w-full h-14 leading-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#ED2939] transition-all"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
                <FaCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-black uppercase text-slate-900 mb-2">Sucesso!</h2>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter">Sua nova senha foi salva. Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4 text-center">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">Nova Credencial</h2>
                {email && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{email}</p>}
              </div>

              <Input
                id="password"
                type="password"
                label="NOVA SENHA"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-16 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
              />
              
              <Input
                id="confirmPassword"
                type="password"
                label="CONFIRMAR SENHA"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="h-16 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-(--clara-rose)/20 transition-all"
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
                {isSubmitting ? 'Atualizando...' : 'Redefinir Senha'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}