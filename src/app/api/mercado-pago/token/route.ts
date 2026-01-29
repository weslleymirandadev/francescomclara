export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { MercadoPagoConfig, CardToken } from "mercadopago";
import { getMercadoPagoToken } from "@/lib/mercadopago";

const token = await getMercadoPagoToken();

const mp = new MercadoPagoConfig({
  accessToken: token,
});

/**
 * Gera um token de cartão do Mercado Pago
 * Esta rota recebe os dados do cartão e retorna um token seguro
 * Necessário para checkout transparente de assinaturas
 */
export async function POST(req: Request) {

  try {
    const { 
      cardNumber, 
      cardholderName, 
      cardExpirationMonth, 
      cardExpirationYear, 
      securityCode, 
      identificationType, 
      identificationNumber 
    } = await req.json();

    if (!cardNumber || !cardholderName || !cardExpirationMonth || !cardExpirationYear || !securityCode || !identificationType || !identificationNumber) {
      return NextResponse.json(
        { error: "Todos os dados do cartão são obrigatórios" },
        { status: 400 }
      );
    }

    const cardToken = new CardToken(mp);

    // Remove espaços e formatações do número do cartão
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    const tokenData = {
      card_number: cleanCardNumber,
      cardholder: {
        name: cardholderName,
        identification: {
          type: identificationType,
          number: identificationNumber.replace(/\D/g, ''),
        },
      },
      card_expiration_month: cardExpirationMonth,
      card_expiration_year: cardExpirationYear,
      security_code: securityCode,
    };

    const response = await cardToken.create({ body: tokenData });

    if (!response.id) {
      return NextResponse.json(
        { error: "Erro ao gerar token do cartão" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token: response.id,
    });

  } catch (err: any) {
    console.error('Erro ao gerar token do cartão:', err);
    return NextResponse.json(
      { 
        error: "Erro ao gerar token do cartão", 
        details: err?.message || String(err) 
      },
      { status: 500 }
    );
  }
}

