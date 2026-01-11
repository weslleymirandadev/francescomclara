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

interface Plan {
  id?: string;
  name: string;
  price: number;
  period: 'MONTHLY' | 'YEARLY';
  active: boolean;
  features: string[];
}

export default function SubscriptionClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const openCreateModal = () => {
    setEditingPlan({ name: "", price: 0, period: "MONTHLY", active: true, features: [""] });
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

    setIsLoading(true);
    const res = await upsertSubscriptionPlan(editingPlan);
    setIsLoading(false);

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

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-50 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-frenchpress text-[var(--interface-accent)] uppercase tracking-tighter">
              Abonnements 🏷️
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic mt-1">
              Configuração e valores dos planos
            </p>
          </div>

          <Button onClick={openCreateModal} className="bg-slate-900 text-white rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus size={18} /> Nouveau Plan
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm flex flex-col relative">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-frenchpress">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900">{formatPrice(plan.price)}</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">/ {plan.period === 'YEARLY' ? 'an' : 'mois'}</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={14} className="text-emerald-500" /> <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-6 border-t border-slate-50">
                <Button variant="outline" onClick={() => openEditModal(plan)} className="flex-1 rounded-xl border-slate-100 font-bold text-xs gap-2">
                  <Edit2 size={14} /> Editar
                </Button>
                <Button variant="outline" onClick={() => handleDelete(plan.id!)} className="w-12 h-10 rounded-xl border-slate-100 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE EDIÇÃO / CRIAÇÃO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-[2rem] p-8 my-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black font-frenchpress uppercase tracking-tighter">
                {editingPlan?.id ? "Modifier le Plan" : "Nouveau Plan"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome do Plan</label>
                <Input 
                  value={editingPlan?.name} 
                  onChange={e => setEditingPlan(prev => ({ ...prev!, name: e.target.value }))}
                  className="rounded-xl bg-slate-50 border-none h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preço (R$)</label>
                  <Input 
                    type="number"
                    value={editingPlan ? editingPlan.price / 100 : 0}
                    onChange={e => {
                        const val = Number(e.target.value);
                        setEditingPlan(prev => ({ ...prev!, price: Math.round(val * 100) }));
                    }}
                    className="rounded-xl bg-slate-50 border-none h-11"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Período</label>
                  <Select 
                    value={editingPlan?.period} 
                    onValueChange={v => setEditingPlan(prev => ({ ...prev!, period: v as any }))}
                  >
                    <SelectTrigger className="rounded-xl bg-slate-50 border-none h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="YEARLY">Anual</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <button onClick={() => removeFeature(index)} className="text-slate-300 hover:text-rose-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={addFeature} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-[var(--interface-accent)]">
                  + Adicionar Vantagem
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white rounded-xl h-12 font-bold"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}