"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiChevronLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Importando seus componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'As novas senhas não coincidem.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: JSON.stringify({ 
          action: "CHANGE_PASSWORD",
          currentPassword, 
          newPassword 
        }),
        headers: { "Content-Type": "application/json" },
      });

      // Verifica se a resposta está vazia antes de dar o parse
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.error || "Erro ao atualizar senha");

      setStatus({ type: 'success', message: 'Senha atualizada com sucesso!' });
      setTimeout(() => router.push("/perfil"), 1500);
    } catch (err: any) {
      // Se o erro for o parse do JSON, ele cairá aqui
      setStatus({ type: 'error', message: err.message === "Unexpected end of JSON input" 
        ? "O servidor não enviou uma resposta válida." 
        : err.message 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pt-6 pb-6 bg-[var(--color-s-50)] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link 
          href="/configuracoes" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-s-400)] hover:text-[var(--color-s-900)] transition-colors mb-6"
        >
          <FiChevronLeft size={16} /> Voltar as Configurações
        </Link>

        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-4 pb-2">
            <div className="w-14 h-14 bg-[var(--color-s-900)] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FiLock size={24} />
            </div>
            <CardTitle className="text-3xl">
              Alterar <br /> 
              <span className="text-[var(--clara-rose)]">Sua Senha</span>
            </CardTitle>
            <p className="text-[10px] font-bold text-[var(--color-s-400)] uppercase tracking-widest">
              Segurança da Conta
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <Input
                label="Senha Atual"
                name="currentPassword"
                type="password"
                required
                placeholder="Sua senha de acesso"
              />

              <div className="space-y-4 pt-4 border-t border-[var(--color-s-100)]">
                <Input
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                />

                <Input
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                />
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {status.message}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                size="lg"
                className="w-full text-[11px] tracking-[0.2em] uppercase"
              >
                {loading ? "Processando..." : "Atualizar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}