"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/minha-conta";

  const { status } = useSession();
  const hasSyncedRef = useRef(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !hasSyncedRef.current) {
      // Se a callbackUrl é relacionada ao checkout, sincronizar carrinho antes de redirecionar
      const isCheckoutFlow = callbackUrl.startsWith("/checkout");
      
      if (isCheckoutFlow) {
        hasSyncedRef.current = true;
        router.replace(callbackUrl);
      } else {
        router.replace(callbackUrl);
      }
    }
  }, [status, router, callbackUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInFormData) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setFormError(result?.error ?? "Erro ao fazer login. Tente novamente.");
        return;
      }

      router.push(result.url ?? callbackUrl);
      router.refresh();
    } catch (error) {
      setFormError("Erro inesperado ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSocialLogin(provider: "google") {
    void signIn(provider, { callbackUrl });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <div className="space-y-2 text-center relative z-10">
          <h2 className="text-4xl font-semibold tracking-tight text-black">Entrar</h2>
          <p className="text-sm text-gray-500">
            Acesse com seu e-mail e senha ou acesse com o Google.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative bg-white z-10">
          <Input
            id="email"
            type="email"
            label="E-mail"
            autoComplete="email"
            error={errors.email}
            {...register("email")}
          />

          <Input
            id="password"
            type="password"
            label="Senha"
            autoComplete="current-password"
            error={errors.password}
            {...register("password")}
          />

          <div className="text-right">
            <a
              href="/auth/esqueci-a-senha"
              className="text-sm text-black hover:text-gray-500"
            >
              Esqueceu sua senha?
            </a>
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex cursor-pointer w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 relative z-10">
          Não tem uma conta?{" "}
          <Link 
            href={`/auth/registrar${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="font-medium text-gray-900 hover:underline"
          >
            Cadastre-se
          </Link>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex cursor-pointer w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FaGoogle className="h-5 w-5" />
            <span>Continuar com Google</span>
          </button>
        </div>
      </section>
    </main>
  );
}
