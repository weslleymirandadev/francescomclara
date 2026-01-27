"use client";

import { Crown, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/price";

interface SubscriptionPlanCardProps {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isBestValue?: boolean;
  features: string[] | any;
  onSubscribe?: (planId: string) => void;
  buttonText?: string; 
  disabled?: boolean;
  className?: string;
}

export function SubscriptionPlanCard({
  id,
  name,
  monthlyPrice,
  yearlyPrice,
  isBestValue = false,
  features,
  onSubscribe,
  buttonText = "Assinar Agora",
  className = "",
}: SubscriptionPlanCardProps) {
  const finalMonthlyPrice = monthlyPrice || 0;
  const finalYearlyPrice = yearlyPrice || 0;
  const yearlyMonthlyPrice = finalYearlyPrice > 0 ? Math.round(finalYearlyPrice / 12) : 0;

  const handleClick = () => {
    if (onSubscribe) {
      onSubscribe(id);
    }
  };

  return (
    <div className={`relative p-8 rounded-3xl bg-white border ${isBestValue ? "border-blue-500" : "border-(--color-s-200)"} shadow-sm hover:border-blue-500 transition-all group flex flex-col h-full min-h-[600px] ${className}`}>
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg">
          Melhor Valor
        </div>
      )}

      <div className="flex flex-col items-center justify-center mb-6 shrink-0">
        <h3 className="text-xl font-bold text-white inline-flex bg-linear-to-r from-clara-rose to-pink-500 py-2 px-4 rounded-md items-center gap-2 m-0 mb-4">
          <Crown size={25} /> <span>{name}</span>
        </h3>

        <div className="w-full">
          <div className="text-center">
            <p className="text-xs text-s-500 mb-1">Plano Mensal</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold text-s-500">{formatPrice(finalMonthlyPrice)}</span>
              <span className="text-s-500 text-sm font-medium">/mês</span>
            </div>
          </div>
        </div>

        <div className="w-full relative">
          <hr className="border w-full border-(--color-s-200) my-4" />
          <p className="text-xs text-s-500 mb-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">OU</p>
        </div>

        <div className="w-full">
          <div className="text-center">
            <p className="text-xs text-s-500 mb-1">Plano Anual</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-black">{formatPrice(yearlyMonthlyPrice)}</span>
              <span className="text-s-500 text-sm font-medium">/mês</span>
            </div>
            <p className="text-[10px] text-s-500 mt-1">
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
            features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-s-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-s-500 text-center">Nenhuma vantagem definida</li>
          )}
        </ul>

        <button
          onClick={handleClick}
          className="w-full py-3 rounded-xl font-bold bg-black text-white hover:opacity-90 transition-all shadow-md text-sm mt-auto cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
