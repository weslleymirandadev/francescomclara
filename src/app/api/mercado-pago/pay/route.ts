import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PreapprovalRequest {
  reason: string;
  external_reference: string;
  payer_email: string;
  card_token_id?: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'days' | 'months';
    transaction_amount: number;
    currency_id: 'BRL';
    start_date?: string;
    end_date?: string;
  };
  back_url?: string;
  status?: 'authorized' | 'pending';
  payment_method_id?: string;
  installments?: number;
  payer?: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

/**
 * Cria uma assinatura recorrente usando a API de Preapproval do Mercado Pago
 * Suporta dois modos:
 * 1. Com token (transparente): autoriza imediatamente sem redirecionamento
 * 2. Sem token: redireciona para checkout do Mercado Pago
 */
export async function POST(req: Request) {
  try {
    const {
      payer,
      userId,
      items,
      total,
      token, // Token do cartão (opcional - se fornecido, cria assinatura transparente)
      method, // Método de pagamento (opcional - usado apenas com token)
      installments = 1, // Parcelas (opcional - usado apenas com token)
      frequencyType = 'months', // 'days' ou 'months'
      frequency = 1, // Frequência de cobrança (ex: 1 = mensal, 2 = bimestral)
      // Dados do cartão para salvar (opcional - usado apenas com token)
      cardData,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item no carrinho" },
        { status: 400 }
      );
    }

    if (!payer?.email) {
      return NextResponse.json(
        { error: "Email do pagador é obrigatório" },
        { status: 400 }
      );
    }

    const isTransparent = !!token;
    console.log(`Criando assinatura ${isTransparent ? 'transparente' : 'com redirecionamento'}`);
    console.log('Items recebidos:', JSON.stringify(items, null, 2));

    // Validar que todas as trilhas existem
    const trackIds = items.map(item => item.id);
    const existingTracks = await prisma.track.findMany({
      where: { id: { in: trackIds } },
      select: { id: true, name: true }
    });
    
    const existingTrackIds = new Set(existingTracks.map((t: any) => t.id));
    const missingTracks = trackIds.filter(id => !existingTrackIds.has(id));
    
    if (missingTracks.length > 0) {
      return NextResponse.json(
        { error: `Trilhas não encontradas: ${missingTracks.join(', ')}` },
        { status: 404 }
      );
    }

    // Enriquecer items com dados das trilhas
    const enrichedItems = items.map(item => {
      const track = existingTracks.find((t: any) => t.id === item.id);
      return {
        ...item,
        title: track?.name || item.title,
        price: item.price || 0, // Trilhas podem não ter preço direto
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || ''
      };
    });

    // Calcular o total (em centavos)
    const calculatedTotalInCents = total || enrichedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
    const calculatedTotalInReais = calculatedTotalInCents / 100;
    
    const description = enrichedItems.length === 1
      ? `Assinatura: ${enrichedItems[0].title}`
      : `Assinatura: ${enrichedItems.length} trilhas`;

    // Preparar dados para Preapproval
    const externalReference = `subscription-${userId}-${Date.now()}`;
    
    // Calcular data de início (hoje) e fim (12 meses depois)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12);
    subscriptionEndDate.setHours(23, 59, 59, 999);

    const preapprovalData: PreapprovalRequest = {
      reason: description,
      external_reference: externalReference,
      payer_email: payer.email,
      auto_recurring: {
        frequency: frequency,
        frequency_type: frequencyType as 'days' | 'months',
        transaction_amount: calculatedTotalInReais,
        currency_id: 'BRL',
        start_date: startDate.toISOString(),
        end_date: subscriptionEndDate.toISOString(),
      },
      back_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
      status: token ? 'authorized' : 'pending', // Se tiver token, já autoriza
      payer: {
        email: payer.email,
        first_name: payer.firstName || payer.name?.split(' ')[0] || '',
        last_name: payer.lastName || payer.name?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: payer.cpf?.replace(/\D/g, '') || ''
        }
      },
    };

    // Se tiver token, adicionar dados do cartão para checkout transparente
    if (token) {
      preapprovalData.card_token_id = token;
      if (method) {
        preapprovalData.payment_method_id = method;
      }
      if (installments > 1) {
        preapprovalData.installments = installments;
      }
    }

    // Obter meliSessionId do header (crucial para checkout transparente/antifraude)
    const meliSessionId = req.headers.get('X-meli-session-id');

    // Criar Preapproval via API REST do Mercado Pago
    const mpApiUrl = process.env.MP_API_URL || 'https://api.mercadopago.com';
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'X-Idempotency-Key': crypto.randomUUID(),
      'X-meli-session-id': meliSessionId!
    };

    const response = await fetch(`${mpApiUrl}/preapproval`, {
      method: 'POST',
      headers,
      body: JSON.stringify(preapprovalData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao criar assinatura no Mercado Pago:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      return NextResponse.json(
        {
          error: "Erro ao processar assinatura no gateway",
          details: process.env.NODE_ENV === 'development' ? JSON.stringify(errorData) : undefined
        },
        { status: response.status || 500 }
      );
    }

    const preapprovalResponse = await response.json();

    if (!preapprovalResponse?.id) {
      console.error('Resposta do Mercado Pago sem ID:', preapprovalResponse);
      return NextResponse.json(
        { error: "Falha ao processar assinatura no gateway" },
        { status: 500 }
      );
    }

    const mpPreapprovalId = preapprovalResponse.id.toString();
    const isAuthorized = preapprovalResponse.status === 'authorized';

    console.log('Assinatura criada com sucesso:', {
      id: mpPreapprovalId,
      status: preapprovalResponse.status,
      isAuthorized,
      init_point: preapprovalResponse.init_point,
    });

    // Calcular data de término para matrículas
    const enrollmentEndDate = new Date();
    if (frequencyType === 'months') {
      enrollmentEndDate.setMonth(enrollmentEndDate.getMonth() + (12 * frequency));
    } else {
      enrollmentEndDate.setDate(enrollmentEndDate.getDate() + (365 * frequency));
    }

    // Criar registro de pagamento/assinatura no banco e conceder acesso se autorizado
    const payment = await prisma.payment.create({
      data: {
        userId,
        mpPaymentId: mpPreapprovalId,
        status: isAuthorized ? 'APPROVED' : (preapprovalResponse.status || 'pending'),
        amount: calculatedTotalInCents,
        metadata: {
          type: 'subscription',
          isTransparent: isTransparent,
          ...(method && { paymentMethod: method }),
          ...(installments > 1 && { installments }),
          frequency,
          frequencyType,
          items: enrichedItems.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
          external_reference: externalReference,
          ...(preapprovalResponse.init_point && { init_point: preapprovalResponse.init_point }),
          ...(preapprovalResponse.sandbox_init_point && { sandbox_init_point: preapprovalResponse.sandbox_init_point }),
        },
        items: {
          create: enrichedItems.map(item => ({
            trackId: item.id,
            price: item.price,
            quantity: item.quantity,
            title: item.title,
            description: item.description || `Trilha: ${item.title}`,
          })),
        },
      },
    });

    // Se for checkout transparente e tiver dados do cartão, salvar método de pagamento
    if (isTransparent && token && cardData) {
      try {
        // Verificar se já existe um método padrão para este usuário
        const existingDefault = await prisma.paymentMethod.findFirst({
          where: {
            userId,
            isDefault: true,
            isActive: true,
          },
        });

        // Extrair últimos 4 dígitos do número do cartão
        const cardNumber = cardData.cardNumber?.replace(/\s/g, '') || '';
        const last4Digits = cardNumber.slice(-4);

        // Parse da data de validade
        const expiry = cardData.expiry || '';
        const [expiryMonth, expiryYear] = expiry.split('/');
        const expiryYearFull = expiryYear ? parseInt(`20${expiryYear}`) : new Date().getFullYear() + 1;
        const expiryMonthNum = expiryMonth ? parseInt(expiryMonth) : 12;

        // Salvar método de pagamento
        await prisma.paymentMethod.create({
          data: {
            userId,
            paymentId: payment.id,
            last4Digits: last4Digits || '****',
            brand: method || 'unknown',
            holderName: cardData.holderName || payer.name || '',
            expiryMonth: expiryMonthNum,
            expiryYear: expiryYearFull,
            mpCardToken: token,
            isDefault: !existingDefault, // Primeiro cartão é padrão
            isActive: true,
            metadata: {
              installments: installments > 1 ? installments : undefined,
            },
          },
        });

        console.log('Método de pagamento salvo com sucesso para assinatura transparente');
      } catch (paymentMethodError) {
        console.error('Erro ao salvar método de pagamento:', paymentMethodError);
        // Não falhar a criação da assinatura se houver erro ao salvar o método de pagamento
      }
    }

    // Conceder acesso
    if (isAuthorized) {
      await Promise.all(
        enrichedItems.map(item =>
          prisma.enrollment.upsert({
            where: {
              userId_trackId: { userId, trackId: item.id }
            },
            create: {
              userId,
              trackId: item.id,
              startDate: new Date(),
              endDate: enrollmentEndDate,
            },
            update: {
              endDate: enrollmentEndDate,
            }
          })
        )
      );
    }

    return NextResponse.json({
      id: preapprovalResponse.id,
      status: preapprovalResponse.status,
      init_point: preapprovalResponse.init_point,
      sandbox_init_point: preapprovalResponse.sandbox_init_point,
      external_reference: externalReference,
      isTransparent: isTransparent,
      // Se for transparente e já autorizado, não precisa redirecionar
      requiresRedirect: !isTransparent || preapprovalResponse.status !== 'authorized',
    });

  } catch (err) {
    console.error('Erro ao processar assinatura:', err);
    return NextResponse.json(
      { 
        error: "Erro ao processar assinatura", 
        details: err instanceof Error ? err.message : String(err) 
      },
      { status: 500 }
    );
  }
}