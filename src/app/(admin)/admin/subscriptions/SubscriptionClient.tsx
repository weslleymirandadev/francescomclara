"use client";

import { useState, useEffect } from "react";
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
import { Icon } from "@iconify/react";

interface Plan {
  id?: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  type: 'INDIVIDUAL' | 'FAMILY';
  active: boolean;
  features: string[];
  isBestValue: boolean;
}

const formatToDisplay = (cents: number) => {
  if (!cents) return "0,00";
  const value = (cents / 100).toFixed(2);
  return value.replace(".", ",");
};

const AVAILABLE_FEATURES = [
  { id: 'all_tracks', label: 'Todas as Trilhas', icon: 'ph:layers-fill' },
  { id: 'specific_tracks', label: 'Trilhas Selecionadas', icon: 'ph:list-checks-fill' },
  { id: 'flashcards', label: 'Flashcards Ilimitados', icon: 'ph:cards-fill' },
  { id: 'forum_access', label: 'Acesso ao Fórum', icon: 'ph:chats-teardrop-fill' },
  { id: 'offline_mode', label: 'Modo Offline', icon: 'ph:cloud-arrow-down-fill' },
  { id: 'certificate', label: 'Certificado de Conclusão', icon: 'ph:certificate-fill' },
  { id: 'priority_support', label: 'Suporte Prioritário', icon: 'ph:headset-fill' },
  { 
    id: 'family_slots', 
    label: 'Compartilhar com até X pessoas', 
    icon: 'ph:users-four-fill',
    description: 'Permite convidar membros para a mesma assinatura.'
  },
  { 
    id: 'kids_content', 
    label: 'Conteúdo Kids', 
    icon: 'ph:baby-fill',
    description: 'Acesso a trilhas específicas para crianças.'
  },
  { 
    id: 'multi_device', 
    label: 'Telas Simultâneas', 
    icon: 'ph:devices-fill',
    description: 'Acesso em vários dispositivos ao mesmo tempo.'
  },
];

export default function SubscriptionClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [availableTracks, setAvailableTracks] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/public/content");
      const data = await res.json();
      setAvailableTracks(data.tracks || []);
    }
    loadData();
  }, []);

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
    <div className="w-full bg-white min-h-screen animate-in fade-in duration-700">
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
              isBestValue={plan.isBestValue}
              active={plan.active}
              features={plan.features}
              availableTracks={availableTracks}
              onEdit={openEditModal}
              disabled={loading || deletingPlanId !== null}
              type={plan.type}
            />
          ))}

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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Tipo
                </label>
                <Select 
                  value={editingPlan?.type || undefined} 
                  onValueChange={v => setEditingPlan(prev => ({ 
                    ...prev!, 
                    type: v as 'INDIVIDUAL' | 'FAMILY' 
                  }))}
                >
                  <SelectTrigger className="rounded-md cursor-pointer bg-slate-100 border-none h-11 w-full">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="FAMILY">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
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
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preço Mensal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={formatToDisplay((editingPlan?.monthlyPrice || 0))}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const cents = Number(rawValue);
                        setEditingPlan(prev => ({ ...prev!, monthlyPrice: cents }));
                      }}
                      className="rounded-md bg-slate-100 border-none h-11 pl-10 font-mono font-bold"
                      placeholder="0,00"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-interface-accent italic">
                    {formatPrice(editingPlan?.monthlyPrice || 0)}/mês
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preço Anual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={formatToDisplay((editingPlan?.yearlyPrice || 0))}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const cents = Number(rawValue);
                        setEditingPlan(prev => ({ ...prev!, yearlyPrice: cents }));
                      }}
                      className="rounded-md bg-slate-100 border-none h-11 pl-10 font-mono font-bold"
                      placeholder="0,00"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-green-600 italic">
                    {formatPrice(Math.round((editingPlan?.yearlyPrice || 0) / 12))}/mês (equivalente)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Funcionalidades do Plano
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_FEATURES.map((feature) => {
                    const isFamily = feature.id === 'family_slots';
                    
                    if (!editingPlan) return null;

                    const selectedFeature = editingPlan.features?.find(f => 
                      isFamily ? f.startsWith('family_slots:') : f === feature.id
                    );
                    const isSelected = !!selectedFeature;

                    return (
                      <div key={feature.id} className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const currentFeatures = [...(editingPlan.features || [])];
                            let newFeatures: string[];
                            
                            if (isSelected) {
                              newFeatures = currentFeatures.filter(f => 
                                isFamily ? !f.startsWith('family_slots:') : f !== feature.id
                              );
                            } else {
                              const defaultValue = isFamily ? 'family_slots:2' : feature.id;
                              newFeatures = [...currentFeatures, defaultValue];
                            }

                            setEditingPlan({ ...editingPlan, features: newFeatures } as Plan);
                          }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-(--interface-accent) bg-blue-50 text-blue-900 shadow-sm' 
                              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          <Icon icon={feature.icon} className={`text-xl ${isSelected ? 'text-(--interface-accent)' : 'text-slate-300'}`} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{feature.label}</span>
                        </button>

                        {isFamily && isSelected && (
                          <div className="px-4 py-3 bg-blue-100/50 rounded-xl flex items-center justify-between border border-blue-200/50 -mt-1">
                            <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Quantidade de vagas:</span>
                            <select 
                              className="bg-white px-2 py-1 rounded-lg text-xs font-black text-blue-900 outline-none border border-blue-200 shadow-sm"
                              value={selectedFeature?.split(':')[1] || "2"}
                              onChange={(e) => {
                                const newQty = e.target.value;
                                const updatedFeatures = (editingPlan.features || []).map(f => 
                                  f.startsWith('family_slots:') ? `family_slots:${newQty}` : f
                                );
                                setEditingPlan({ ...editingPlan, features: updatedFeatures } as Plan);
                              }}
                            >
                              {[2, 3, 4, 5, 6, 8, 10].map(num => (
                                <option key={num} value={num.toString()}>{num} Pessoas</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {feature.id === 'specific_tracks' && isSelected && (
                          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                              Liberação de Trilhas (Acesso Específico)
                            </label>
                            
                            <Select 
                              onValueChange={(trackId) => {
                                if (!editingPlan) return;
                                const key = `track:${trackId}`;
                                if (!editingPlan.features.includes(key)) {
                                  setEditingPlan({
                                    ...editingPlan,
                                    features: [...editingPlan.features, key]
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="bg-white border-slate-200 h-11 w-45 rounded-xl">
                                <SelectValue placeholder="Adicionar trilha ao plano..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTracks.map((track) => (
                                  <SelectItem key={track.id} value={track.id}>
                                    {track.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="flex flex-wrap gap-2 mt-2">
                              {editingPlan?.features
                                .filter(f => f.startsWith('track:'))
                                .map(featureKey => {
                                  const trackId = featureKey.split(':')[1];
                                  const trackName = availableTracks.find(t => t.id === trackId)?.name || "Trilha Desconhecida";
                                  
                                  return (
                                    <div key={featureKey} className="flex items-center gap-2 bg-interface-accent/10 text-interface-accent px-3 py-1.5 rounded-full border border-interface-accent/20">
                                      <span className="text-[10px] font-bold uppercase">{trackName}</span>
                                      <button 
                                        onClick={() => {
                                          setEditingPlan({
                                            ...editingPlan,
                                            features: editingPlan.features.filter(f => f !== featureKey)
                                          });
                                        }}
                                        className="hover:text-rose-500 transition-colors"
                                      >
                                        <X size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 shrink-0 pt-4 border-t border-slate-100 gap-2">
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