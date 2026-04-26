"use client";

import { useState, useEffect } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

interface SupportTicket {
  id: string;
  subject: string;
  priority: string;
  status: string;
  isPriority: boolean;
  createdAt: string;
  responses: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userFeatures, setUserFeatures] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    loadUserFeatures();
    loadTickets();
  }, []);

  const loadUserFeatures = async () => {
    try {
      const res = await fetch("/api/user/features");
      if (res.ok) {
        const features = await res.json();
        setUserFeatures(features);
      }
    } catch (error) {
      console.error("Erro ao carregar features:", error);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setFormData({ subject: "", message: "" });
        loadTickets();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao criar ticket");
      }
    } catch (error) {
      toast.error("Erro ao criar ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVipContact = async () => {
    const loadingToast = toast.loading("Verificando credenciais VIP...");
    try {
      const res = await fetch("/api/support/vip-link");
      const data = await res.json();

      if (res.ok && data.url) {
        toast.success("Acesso liberado!", { id: loadingToast });
        window.open(data.url, "_blank");
      } else {
        toast.error(data.error || "Erro ao validar acesso", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error("Erro na conexão", { id: loadingToast });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <FiAlertCircle className="text-blue-500" />;
      case "IN_PROGRESS":
        return <FiClock className="text-yellow-500" />;
      case "RESOLVED":
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiMessageSquare className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Aberto";
      case "IN_PROGRESS":
        return "Em Andamento";
      case "WAITING_CUSTOMER":
        return "Aguardando Resposta";
      case "RESOLVED":
        return "Resolvido";
      case "CLOSED":
        return "Fechado";
      default:
        return status;
    }
  };

  if (loading) return <Loading />;

  if (!userFeatures?.hasPrioritySupport) {
    return (
      <div className="max-w-4xl mx-auto mb-20 pt-20 text-center">
        <div className="bg-white p-12 rounded-md md:rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMessageSquare size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
            Suporte Não Disponível
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            O suporte prioritário está disponível apenas para planos premium.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-8 py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20 px-6">
      {userFeatures?.hasPrioritySupport ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-3">
              Suporte VIP <span className="text-emerald-500">Ativo</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Olá! Como aluno premium, você tem acesso direto à nossa equipe via
              WhatsApp Business.
            </p>
          </div>

          <div className="bg-linear-to-br from-slate-900 to-slate-800 p-1 rounded-[3rem] shadow-2xl">
            <div className="bg-linear-to-br from-emerald-500 to-emerald-700 p-8 md:p-12 rounded-[2.8rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <FiMessageSquare size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/10 px-4 py-1 rounded-full border border-white/10">
                    Verificado & Seguro
                  </span>
                </div>

                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                  Falar com <br /> a Clara
                </h2>

                <p className="text-emerald-50/80 text-lg mb-10 max-w-sm font-medium leading-relaxed">
                  Dúvidas sobre o curso, problemas técnicos ou acesso? Clique
                  abaixo para iniciar o atendimento prioritário.
                </p>

                <button
                  onClick={handleVipContact}
                  className="bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 flex items-center gap-4 cursor-pointer"
                >
                  <FiSend size={20} /> Iniciar Chat Prioritário
                </button>
              </div>

              <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <FiMessageSquare size={300} />
              </div>
            </div>
          </div>

          {tickets.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  Histórico de Chamados
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold uppercase">
                  {tickets.length} Registros
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white border border-slate-100 p-5 rounded-3xl hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {getStatusIcon(ticket.status)}
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">
                      {ticket.subject}
                    </h4>
                    <p className="text-xs text-slate-500 uppercase font-black tracking-tighter italic">
                      Status: {getStatusText(ticket.status)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 relative">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6">
              <FiAlertCircle size={48} className="text-slate-200" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              Suporte VIP Bloqueado
            </h2>

            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              O acesso direto via WhatsApp Business e o atendimento em tempo
              recorde são exclusivos para nossos alunos dos planos{" "}
              <span className="text-blue-600 font-black">Pro</span> e{" "}
              <span className="text-blue-600 font-black">Elite</span>.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => (window.location.href = "/assinar")}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
              >
                Fazer Upgrade Agora
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                Voltar para o Início
              </button>
            </div>

            <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-4 rounded-3xl rotate-12 shadow-lg">
              <FiClock size={20} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
