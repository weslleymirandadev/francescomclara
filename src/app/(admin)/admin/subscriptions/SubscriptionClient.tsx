"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/price";
import { upsertSubscriptionPlan, deleteSubscriptionPlan } from "./actions";
import { toast } from "react-hot-toast";
import { Loading } from '@/components/ui/loading'
import { AdminSubscriptionPlanCard } from "@/components/AdminSubscriptionPlanCard";

interface Plan {
  id?: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  price?: number; // Compatibilidade
  type: 'INDIVIDUAL' | 'FAMILY';
  period?: 'MONTHLY' | 'YEARLY'; // Compatibilidade
  active: boolean;
  features: string[];
  isBestValue: boolean;
}

export default function SubscriptionClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const openCreateModal = () => {
    setEditingPlan({ name: "", monthlyPrice: 0, yearlyPrice: 0, type: "INDIVIDUAL", active: true, isBestValue: false, features: [""] });
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
    if (!editingPlan?.name || (editingPlan.monthlyPrice || 0) <= 0 || (editingPlan.yearlyPrice || 0) <= 0) {
      return toast.error("Preencha o nome e preços válidos!");
    }

    if (!editingPlan.type) {
      return toast.error("Selecione o tipo do plano!");
    }

    // Validar que o preço anual dividido por 12 seja menor que o mensal
    const yearlyMonthlyPrice = Math.round((editingPlan.yearlyPrice || 0) / 12);
    if (yearlyMonthlyPrice >= (editingPlan.monthlyPrice || 0)) {
      return toast.error("O preço anual deve ser mais barato que o mensal (preço anual/12 < preço mensal)!");
    }

    const res = await upsertSubscriptionPlan(editingPlan);
    setLoading(false);

    if (res.success) {
      toast.success("Plano salvo com sucesso! 🌸");
      setIsModalOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Erro ao salvar o plano.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeletingPlanId(id);
      const res = await deleteSubscriptionPlan(id);
      if (res.success) {
        setPlans(plans.filter(p => p.id !== id));
        setIsModalOpen(false);
        setEditingPlan(null);
        toast.success("Plano excluído com sucesso! 🗑️");
      } else {
        toast.error(res.error || "Erro ao excluir o plano. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao excluir o plano. Tente novamente.");
      console.error("Erro ao excluir:", error);
    } finally {
      setDeletingPlanId(null);
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
            <AdminSubscriptionPlanCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              monthlyPrice={plan.monthlyPrice}
              yearlyPrice={plan.yearlyPrice}
              price={plan.price}
              isBestValue={plan.isBestValue}
              active={plan.active}
              features={plan.features}
              onEdit={openEditModal}
              disabled={loading || deletingPlanId !== null}
            />
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
          <DialogContent className="max-w-md rounded-[2rem] p-8 mt-5">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-2xl font-black font-frenchpress uppercase tracking-tighter">
                {editingPlan?.id ? "Modifier le Plan" : "Nouveau Plan"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome do Plano</label>
                <Input 
                  value={editingPlan?.name} 
                  onChange={e => setEditingPlan(prev => ({ ...prev!, name: e.target.value }))}
                  className="rounded-md bg-slate-100 border-none h-11"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo</label>
                <Select 
                  value={editingPlan?.type} 
                  onValueChange={v => setEditingPlan(prev => ({ ...prev!, type: v as 'INDIVIDUAL' | 'FAMILY' }))}
                >
                  <SelectTrigger className="rounded-md cursor-pointer bg-slate-100 border-none h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="FAMILY">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-900 mb-1">
                    Melhor Preço
                  </label>
                  <p className="text-xs text-slate-600">
                    Marque este plano como melhor valor
                  </p>
                </div>
                <Switch
                  checked={editingPlan?.isBestValue || false}
                  onCheckedChange={(checked) => 
                    setEditingPlan(prev => ({ ...prev!, isBestValue: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Preço Mensal */}
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preço Mensal</label>
                  <Input 
                    type="number"
                    value={editingPlan ? (editingPlan.monthlyPrice || editingPlan.price || 0) / 100 : 0}
                    onChange={e => {
                        const val = Number(e.target.value);
                        setEditingPlan(prev => ({ ...prev!, monthlyPrice: Math.round(val * 100) }));
                    }}
                    className="rounded-md bg-slate-100 border-none h-11"
                  />
                  <p className="text-[10px] font-bold text-interface-accent italic">
                    {formatPrice(editingPlan?.monthlyPrice || editingPlan?.price || 0)}/mês
                  </p>
                </div>
                
                {/* Preço Anual */}
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preço Anual</label>
                  <Input 
                    type="number"
                    value={editingPlan ? (editingPlan.yearlyPrice || 0) / 100 : 0}
                    onChange={e => {
                        const val = Number(e.target.value);
                        setEditingPlan(prev => ({ ...prev!, yearlyPrice: Math.round(val * 100) }));
                    }}
                    className="rounded-md bg-slate-100 border-none h-11"
                  />
                  <p className="text-[10px] font-bold text-green-600 italic">
                    {formatPrice(Math.round((editingPlan?.yearlyPrice || 0) / 12))}/mês
                  </p>
                  {editingPlan && editingPlan.yearlyPrice > 0 && editingPlan.monthlyPrice > 0 && (
                    <p className="text-[9px] text-slate-500">
                      Economia: {formatPrice((editingPlan.monthlyPrice || editingPlan.price || 0) - Math.round(editingPlan.yearlyPrice / 12))}/mês
                    </p>
                  )}
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
                        className="rounded-md bg-slate-100 border-none h-9 text-xs"
                      />
                      <button onClick={() => removeFeature(index)} className="cursor-pointer text-black hover:text-rose-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={addFeature} className="w-full cursor-pointer text-[10px] font-black uppercase text-slate-400 hover:text-interface-accent">
                  + Adicionar Vantagem
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4 flex-shrink-0 pt-4 border-t border-slate-100 gap-2">
              {editingPlan?.id && (
                <Button 
                  onClick={() => handleDelete(editingPlan.id!)}
                  disabled={loading || deletingPlanId !== null}
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md h-12 font-bold"
                >
                  {deletingPlanId === editingPlan.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={loading || deletingPlanId !== null}
                className={`${editingPlan?.id ? 'flex-1' : 'w-full'} bg-slate-900 text-white rounded-md h-12 font-bold`}
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