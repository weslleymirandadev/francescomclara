"use client";

import { Crown, CheckCircle2, Check, Edit2 } from "lucide-react";
import { formatPrice } from "@/lib/price";
import { Button } from "@/components/ui/button";

interface AdminSubscriptionPlanCardProps {
  id?: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  price?: number; // Compatibilidade
  isBestValue?: boolean;
  active: boolean;
  features: string[] | any;
  onEdit?: (plan: any) => void;
  disabled?: boolean;
  className?: string;
}

export function AdminSubscriptionPlanCard({
  id,
  name,
  monthlyPrice,
  yearlyPrice,
  price,
  isBestValue = false,
  active,
  features,
  onEdit,
  disabled = false,
  className = "",
}: AdminSubscriptionPlanCardProps) {
  const finalMonthlyPrice = monthlyPrice || price || 0;
  const finalYearlyPrice = yearlyPrice || 0;
  const yearlyMonthlyPrice = finalYearlyPrice > 0 ? Math.round(finalYearlyPrice / 12) : 0;

  const handleEdit = () => {
    if (onEdit) {
      onEdit({
        id,
        name,
        monthlyPrice,
        yearlyPrice,
        price,
        isBestValue,
        active,
        features,
      });
    }
  };

  return (
    <div className={`relative p-8 rounded-3xl bg-white border ${isBestValue ? "border-blue-500" : "border-slate-100"} shadow-sm hover:border-interface-accent transition-all group flex flex-col h-full min-h-[600px] ${className}`}>
      {/* Badge Melhor Valor */}
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg z-10">
          Melhor Valor
        </div>
      )}

      {/* Indicador de Status Ativo/Inativo */}
      <div className="absolute top-4 right-4 z-10">
        {active ? (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
            <Check size={10} /> Ativo
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase text-s-500 bg-slate-50 px-2 py-1 rounded-full">
            Inativo
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center mb-6 shrink-0">
        <h3 className="text-xl font-bold text-white inline-flex bg-linear-to-r from-clara-rose to-pink-500 py-2 px-4 rounded-md items-center gap-2 m-0 mb-4">
          <Crown size={25} /> <span>{name}</span>
        </h3>

        {/* Preço Mensal */}
        <div className="w-full">
          <div className="text-center">
            <p className="text-xs text-s-500 mb-1 uppercase">Plano Mensal</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold text-s-500">{formatPrice(finalMonthlyPrice)}</span>
              <span className="text-s-500 text-sm font-medium">/mês</span>
            </div>
          </div>
        </div>

        <div className="w-full relative">
          <hr className="border w-full border-slate-200 my-4" />
          <p className="text-xs text-s-500 mb-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">OU</p>
        </div>

        {/* Preço Anual */}
        <div className="w-full">
          <div className="text-center">
            <p className="text-xs text-s-500 mb-1 uppercase">Plano Anual</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-black">{formatPrice(yearlyMonthlyPrice)}</span>
              <span className="text-s-500 text-sm font-medium">/mês</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {formatPrice(finalYearlyPrice)} por ano
            </p>
            {finalMonthlyPrice > 0 && yearlyMonthlyPrice > 0 && (
              <p className="text-[10px] text-black font-bold mt-1">
                Economize {formatPrice(finalMonthlyPrice - yearlyMonthlyPrice)}/mês
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <ul className="space-y-4 mb-8 shrink-0">
          {features && Array.isArray(features) && features.length > 0 ? (
            features.slice(0, 5).map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-s-500 text-center">Nenhuma vantagem definida</li>
          )}
          {features && Array.isArray(features) && features.length > 5 && (
            <li className="text-xs text-s-500 italic text-center">
              +{features.length - 5} outras vantagens...
            </li>
          )}
        </ul>

        <Button
          onClick={handleEdit}
          disabled={disabled}
          variant="outline"
          className="w-full py-3 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-interface-accent transition-all shadow-md text-sm mt-auto"
        >
          <Edit2 size={16} className="mr-2" />
          Editar
        </Button>
      </div>
    </div>
  );
}
