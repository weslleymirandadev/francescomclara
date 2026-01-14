"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6 relative z-10">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FaCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Email Enviado!</h2>
        <p className="text-gray-600 mb-6 relative z-10">
          Se o email {email} estiver cadastrado em nossa base, você receberá um link para redefinir sua senha.
        </p>
        <Link
          href="/auth/login"
          prefetch
          className="cursor-pointer text-black hover:text-gray-500 font-medium relative z-10"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
        <p className="text-gray-600 mt-2">Digite seu email para receber um link de recuperação</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 relative bg-white z-10">
        <Input
          id="email"
          type="email"
          label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
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
          {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>
      </form>
      
      <div className="mt-6 text-center relative z-10">
        <Link prefetch href="/login" className="cursor-pointer text-sm text-black hover:text-gray-500">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
