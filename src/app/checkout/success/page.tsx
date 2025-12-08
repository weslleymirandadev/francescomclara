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
  const qrCode = searchParams.get("qr_code");
  const qrCodeBase64 = searchParams.get("qr_code_base64");
  const ticketUrl = searchParams.get("ticket_url");
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
            ? 'Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento. Você receberá uma confirmação por e-mail assim que for aprovado.'
            : 'Obrigado por sua compra! Seu pagamento foi processado com sucesso.'}
        </p>

        {isPix && qrCodeBase64 && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">QR Code PIX</h2>
            <div className="mx-auto flex justify-center">
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`} 
                alt="QR Code PIX" 
                className="h-64 w-64 border border-gray-200"
              />
            </div>
            {qrCode && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Código PIX (copiar e colar):</p>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-3">
                  <code className="flex-1 break-all text-xs text-gray-900">{qrCode}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCode);
                      alert("Código PIX copiado!");
                    }}
                    className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
            {ticketUrl && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
              >
                Ver boleto PIX
              </a>
            )}
          </div>
        )}
        
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
