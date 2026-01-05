"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FaCheck, FaTimes } from "react-icons/fa";

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
        // Codificar o token para URL (pode conter caracteres especiais)
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
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!token) {
      setError('Token inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha');
        return;
      }

      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/auth/login?message=Senha redefinida com sucesso');
      }, 2000);
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto relative z-10"></div>
        <p className="mt-4 text-gray-600 relative z-10">Validando token...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6 relative z-10">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <FaTimes className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Token Inválido</h2>
        <p className="text-gray-600 mb-6 relative z-10">
          {error || 'O link de redefinição de senha é inválido ou expirou. Solicite um novo link.'}
        </p>
        <Link
          href="/auth/esqueci-a-senha"
          prefetch
          className="inline-block cursor-pointer text-black hover:text-gray-500 font-medium relative z-10"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6 relative z-10">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FaCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Senha Redefinida!</h2>
        <p className="text-gray-600 mb-6 relative z-10">
          Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-900">Redefinir Senha</h2>
        <p className="text-gray-600 mt-2">Digite sua nova senha</p>
        {email && (
          <p className="text-sm text-gray-500 mt-1">Para: {email}</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 relative bg-white z-10">
        <Input
          id="password"
          type="password"
          label="Nova Senha"
          required
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
        />
        
        <Input
          id="confirmPassword"
          type="password"
          label="Confirmar Nova Senha"
          required
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          placeholder="Digite a senha novamente"
          minLength={6}
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
      
      <div className="mt-6 text-center relative z-10">
        <Link prefetch href="/auth/login" className="cursor-pointer text-sm text-black hover:text-gray-500">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

