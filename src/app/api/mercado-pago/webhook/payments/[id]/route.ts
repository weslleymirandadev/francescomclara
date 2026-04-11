import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        mpPaymentId: (await params).id,
        userId: session.user.id,
      },
      include: {
        refunds: true,
        items: true
      },
    });

    if (!payment) {
      return new NextResponse(
        JSON.stringify({ error: 'Assinatura não encontrada' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new NextResponse(JSON.stringify(payment), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao buscar informações da assinatura' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}