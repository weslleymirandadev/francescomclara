"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

type PaymentStatus = 'pending' | 'approved' | 'processing' | 'error' | 'refunded' | 'cancelled' | 'failed';

interface PaymentStatusResponse {
  status: PaymentStatus;
  message?: string;
  paymentId?: string;
  isPix?: boolean;
  qrCodeBase64?: string;
  ticketUrl?: string;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [error, setError] = useState<string | null>(null);
  const [isPix, setIsPix] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pagamento não encontrado');
      setPaymentStatus('error');
      return;
    }

    // Limpa o carrinho quando a página é carregada
    clearCart();

    // Inicia a verificação do status do pagamento
    checkPaymentStatus();

    // Configura o polling para verificar o status a cada 5 segundos
    const intervalId = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(intervalId);
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    if (!paymentId) return;
    
    try {
      const response = await fetch(`/api/mercado-pago/status?payment_id=${paymentId}`);
      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento');
      }
      
      const data: PaymentStatusResponse = await response.json();
      
      // Atualiza o estado com os dados do pagamento
      setPaymentStatus(data.status);
      setIsPix(data.isPix || false);
      setQrCodeBase64(data.qrCodeBase64 || null);
      setTicketUrl(data.ticketUrl || null);
      
      // Retorna true se o pagamento estiver finalizado
      return ['approved', 'refunded', 'cancelled', 'failed'].includes(data.status);
      
    } catch (err) {
      console.error('Erro ao verificar status do pagamento:', err);
      setError('Não foi possível verificar o status do pagamento. Por favor, tente novamente mais tarde.');
      setPaymentStatus('error');
      return true; // Para parar o polling em caso de erro
    }
  };
  
  // Efeito para polling do status do pagamento
  useEffect(() => {
    if (!paymentId) {
      setError('ID de pagamento não encontrado');
      setPaymentStatus('error');
      return;
    }

    // Limpa o carrinho quando a página é carregada
    clearCart();

    let intervalId: NodeJS.Timeout;
    
    const startPolling = async () => {
      // Primeira verificação imediata
      const isComplete = await checkPaymentStatus();
      
      // Se não estiver completo, inicia o polling
      if (!isComplete) {
        intervalId = setInterval(async () => {
          const isComplete = await checkPaymentStatus();
          if (isComplete) {
            clearInterval(intervalId);
          }
        }, 5000); // Verifica a cada 5 segundos
      }
    };
    
    startPolling();
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [paymentId]);
  
  // Renderiza o conteúdo com base no status do pagamento
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FaExclamationTriangle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Ocorreu um erro</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <Link
              href="/checkout"
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Voltar para o checkout
            </Link>
          </div>
        </div>
      );
    }

    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <FaSpinner className="h-8 w-8 animate-spin text-gray-600" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Processando pagamento...</h1>
            <p className="mt-2 text-gray-600">Estamos verificando o status do seu pagamento.</p>
          </div>
        );

      case 'pending':
        return (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <FaExclamationTriangle className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-gray-900">Pagamento pendente</h1>
              <p className="mt-2 text-gray-600">
                Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail quando for aprovado.
              </p>
            </div>
            
            {isPix && qrCodeBase64 && (
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">QR Code PIX</h2>
                <div className="flex justify-center">
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`} 
                    alt="QR Code PIX" 
                    className="h-64 w-64"
                  />
                </div>
                <p className="text-sm text-gray-500">Escaneie o QR Code com o app do seu banco para efetuar o pagamento.</p>
              </div>
            )}
            
            {ticketUrl && (
              <div className="mt-4">
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Abrir boleto para pagamento
                </a>
              </div>
            )}
          </>
        );

      case 'approved':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FaCheckCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Pagamento aprovado!</h1>
            <p className="mt-2 text-gray-600">
              Obrigado por sua compra! Seu pagamento foi processado com sucesso.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Ir para o painel
              </Link>
            </div>
          </div>
        );

      case 'cancelled':
      case 'refunded':
      case 'failed':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FaExclamationTriangle className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              {paymentStatus === 'cancelled' ? 'Pagamento cancelado' : 
               paymentStatus === 'refunded' ? 'Pagamento reembolsado' : 'Falha no pagamento'}
            </h1>
            <p className="mt-2 text-gray-600">
              {paymentStatus === 'cancelled' ? 'Seu pagamento foi cancelado.' : 
               paymentStatus === 'refunded' ? 'O valor do seu pagamento foi reembolsado.' : 
               'Ocorreu um erro ao processar seu pagamento.'}
            </p>
            <div className="mt-6 space-x-3">
              <Link
                href="/checkout"
                className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Tentar novamente
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voltar para a página inicial
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        {renderContent()}
        
        {paymentId && (
          <p className="text-sm text-gray-500">
            ID do pagamento: {paymentId}
          </p>
        )}
      </div>
    </main>
  );
}
