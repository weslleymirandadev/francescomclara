"use client";

import { useState, useEffect } from "react";
import { FiSend, FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
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
    message: ""
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Baixa";
      case "NORMAL":
        return "Normal";
      case "HIGH":
        return "Alta";
      case "URGENT":
        return "Urgente";
      default:
        return priority;
    }
  };

  if (loading) return <Loading />;

  if (!userFeatures?.hasPrioritySupport) {
    return (
      <div className="max-w-4xl mx-auto pt-20 text-center">
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
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-slate-900 text-white rounded-md md:rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">
          Suporte Prioritário
        </h1>
        <p className="text-slate-500">
          {userFeatures?.hasPrioritySupport 
            ? "Resposta em até 24h para usuários com plano premium"
            : "Entre em contato conosco"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Novo Ticket */}
        <div className="bg-white p-8 rounded-md md:rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">
            Criar Novo Ticket
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assunto
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva brevemente o problema..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                placeholder="Descreva detalhadamente o seu problema ou dúvida..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={18} />
                  Enviar Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tickets Anteriores */}
        <div className="bg-white p-8 rounded-md md:rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">
            Seus Tickets
          </h2>

          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Você ainda não possui tickets de suporte.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm font-medium text-slate-700">
                        {getStatusText(ticket.status)}
                      </span>
                      {ticket.isPriority && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-full">
                          Prioritário
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-slate-800 mb-1">
                    {ticket.subject}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Prioridade: {getPriorityText(ticket.priority)}</span>
                    <span>{ticket.responses.length} respostas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
