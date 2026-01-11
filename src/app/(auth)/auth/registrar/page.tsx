"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/minha-conta";
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

    // Validações client-side
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
      // Registrar usuário
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Redirecionar para a página de login com callbackUrl preservada
      const loginUrl = `/auth/login?message=${encodeURIComponent('Conta criada com sucesso! Faça login para continuar.')}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      router.push(loginUrl);
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError('Erro ao criar conta. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
        <p className="text-gray-600 mt-2">Registre-se em Frances Com Clara</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 relative bg-white z-10">
        <Input
          id="name"
          name="name"
          type="text"
          label="Nome Completo"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome completo"
        />
        
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Senha"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar Senha"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
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
          {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>
      
      <div className="mt-6 text-center relative z-10">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link 
            prefetch 
            href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="font-medium text-black hover:text-gray-500"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
