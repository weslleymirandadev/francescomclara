"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/price";
import { upsertSubscriptionPlan, deleteSubscriptionPlan } from "./actions";
import { toast } from "react-hot-toast";
import { Loading } from '@/components/ui/loading'

interface Plan {
  id?: string;
  name: string;
  price: number;
  period: 'MONTHLY' | 'YEARLY';
  type: 'INDIVIDUAL' | 'FAMILY';
  active: boolean;
  features: string[];
}

export default function SubscriptionClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const openCreateModal = () => {
    setEditingPlan({ name: "", price: 0, period: "MONTHLY", type: 'INDIVIDUAL', active: true, features: [""] });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ""] });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, features: editingPlan.features.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!editingPlan?.name || editingPlan.price <= 0) {
      return toast.error("Preencha o nome e um preço válido!");
    }

    setLoading(true);
    const res = await upsertSubscriptionPlan(editingPlan);
    setLoading(false);

    if (res.success) {
      toast.success("Plano salvo com sucesso! 🌸");
      setIsModalOpen(false);
      window.location.reload();
    } else {
      toast.error("Erro ao salvar o plano.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja mesmo excluir?")) {
      const res = await deleteSubscriptionPlan(id);
      if (res.success) {
        setPlans(plans.filter(p => p.id !== id));
        toast.success("Excluído!");
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-frenchpress text-interface-accent uppercase tracking-tighter">
              Abonnements 🏷️
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Configuração e valores dos planos
            </p>
          </div>

          <Button onClick={openCreateModal} className="bg-slate-900 text-white rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer">
            <Plus size={18} /> Nouveau Plan
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:border-interface-accent transition-all group relative overflow-hidden">
              
              {/* Indicador de Status Ativo/Inativo */}
              <div className="absolute top-4 right-4">
                {plan.active ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                    <Check size={10} /> Ativo
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    Inativo
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    /{plan.period === 'YEARLY' ? 'an' : 'mês'}
                  </span>
                </div>
                {plan.period === 'YEARLY' && (
                  <p className="text-[10px] text-interface-accent font-bold uppercase mt-1">
                    Equiv. {formatPrice(plan.price / 12)} /mês
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-interface-accent" />
                    {feature}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-[10px] text-slate-400 italic">+{plan.features.length - 3} outras vantagens...</li>
                )}
              </ul>

              <div className="flex gap-2">
                <Button 
                  onClick={() => openEditModal(plan)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 text-xs font-bold cursor-pointer"
                >
                  <Edit2 size={14} className="mr-2" /> Editar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDelete(plan.id!)}
                  className="border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl h-10 w-10 p-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}

          {/* Card para Adicionar Novo */}
          <button 
            onClick={openCreateModal}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 hover:border-interface-accent hover:bg-slate-50 transition-all group min-h-[300px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-interface-accent group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Novo Plano</span>
          </button>
        </div>

        {/* MODAL DE EDIÇÃO / CRIAÇÃO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-[2rem] p-8 my-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black font-frenchpress uppercase tracking-tighter">
                {editingPlan?.id ? "Modifier le Plan" : "Nouveau Plan"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nome do Plano */}
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Nome do Plano</label>
                <Input 
                  value={editingPlan?.name} 
                  onChange={e => setEditingPlan({...editingPlan!, name: e.target.value})}
                  className="rounded-xl bg-slate-50 border-none h-12 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Preço em Centavos */}
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preço (em centavos)</label>
                  <Input 
                    type="number"
                    value={editingPlan?.price} 
                    onChange={e => setEditingPlan({...editingPlan!, price: Number(e.target.value)})}
                    className="rounded-xl bg-slate-50 border-none h-12 font-bold"
                  />
                  {/* Cálculo mensal em tempo real */}
                  <p className="text-[10px] font-bold text-interface-accent italic">
                    Renderiza como: {formatPrice(editingPlan?.price || 0)}
                    {editingPlan?.period === 'YEARLY' && ` (${formatPrice((editingPlan?.price || 0) / 12)}/mês)`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Período */}
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Período</label>
                    <Select 
                      value={editingPlan?.period} 
                      onValueChange={(v: 'MONTHLY' | 'YEARLY') => setEditingPlan({...editingPlan!, period: v})}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 font-bold cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY" className="cursor-pointer">Mensal</SelectItem>
                        <SelectItem value="YEARLY" className="cursor-pointer">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
                    <Select 
                      value={editingPlan?.active ? "true" : "false"} 
                      onValueChange={(v) => setEditingPlan({...editingPlan!, active: v === "true"})}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 font-bold cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true" className="cursor-pointer">Ativo</SelectItem>
                        <SelectItem value="false" className="cursor-pointer">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex justify-between">
                  Vantagens <span>{editingPlan?.features.length}</span>
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {editingPlan?.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={feature} 
                        onChange={e => handleFeatureChange(index, e.target.value)}
                        className="rounded-xl bg-slate-50 border-none h-9 text-xs"
                      />
                      <button onClick={() => removeFeature(index)} className="text-slate-300 hover:text-rose-500 cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={addFeature} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-interface-accent">
                  + Adicionar Vantagem
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-slate-900 text-white rounded-xl h-12 font-bold cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}