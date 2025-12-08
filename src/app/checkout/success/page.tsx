"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

// Ícone de check em SVG
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-10 w-10 text-green-600"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const isPix = searchParams.get("pix") === "true";
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpa o carrinho quando a página é carregada
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckIcon />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900">
          {isPix ? 'Pagamento em processamento!' : 'Pagamento aprovado!'}
        </h1>
        
        <p className="text-gray-600">
          {isPix 
            ? 'Seu pagamento via PIX foi recebido e está sendo processado. Você receberá uma confirmação por e-mail assim que for aprovado.'
            : 'Obrigado por sua compra! Seu pagamento foi processado com sucesso.'}
        </p>
        
        {paymentId && (
          <p className="text-sm text-gray-500">
            ID do pagamento: {paymentId}
          </p>
        )}
        
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Acessar meus cursos
          </Link>
          
          <Link
            href="/"
            className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
