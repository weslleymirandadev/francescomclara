import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 10000,
    idempotencyKey: crypto.randomUUID()
  }
});

interface Item {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export async function POST(req: Request) {
  try {
    const {
      method,
      installments = 1,
      token,
      payer,
      userId,
      items,
      total,
      issuer_id,
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

    // Log items received
    console.log('Items recebidos do frontend:', JSON.stringify(items, null, 2));

    // Validate that all items exist in the database as courses
    const courseIds = items.map(item => item.id);

    console.log('Course IDs para validar:', courseIds);

    // Check if courses exist
    const existingCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, price: true }
    });
    
    const existingCourseIds = new Set(existingCourses.map(c => c.id));
    const missingCourses = courseIds.filter(id => !existingCourseIds.has(id));
    
    if (missingCourses.length > 0) {
      return NextResponse.json(
        { error: `Cursos não encontrados: ${missingCourses.join(', ')}` },
        { status: 404 }
      );
    }

    // Enrich items with course data
    const normalizedItems = items.map(item => {
      const course = existingCourses.find(c => c.id === item.id);
      return {
        ...item,
        title: course?.title || item.title,
        price: course?.price || item.price,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || ''
      };
    });

    const enrichedItems = normalizedItems;

    // Calcular o total se não fornecido (em centavos)
    const calculatedTotalInCents = total || enrichedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
    // Mercado Pago espera valores em reais (float), então convertemos de centavos para reais
    const calculatedTotalInReais = calculatedTotalInCents / 100;
    const description = enrichedItems.length === 1
      ? enrichedItems[0].title
      : `${enrichedItems.length} itens no carrinho`;

    const payment = new Payment(mp);

    const mpData = {
      transaction_amount: calculatedTotalInReais,
      payment_method_id: method,
      installments: method !== 'pix' ? installments : 1,
      ...(issuer_id && { issuer_id }),
      ...(token && { token }),
      ...(method === "pix" && {
        transaction_details: {
          financial_institution: "pix",
        },
      }),
      payer: {
        email: payer.email,
        first_name: payer.firstName || payer.name?.split(' ')[0] || '',
        last_name: payer.lastName || payer.name?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: payer.cpf.replace(/\D/g, '')
        },
        ...(payer.zipCode && {
          address: {
            zip_code: payer.zipCode,
            street_name: payer.streetName || '',
            street_number: payer.streetNumber || '',
            neighborhood: payer.neighborhood || '',
            city: payer.city || '',
            federal_unit: payer.state || ''
          }
        })
      },
      description,
      external_reference: `order-${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/mercado-pago/webhook`,
      metadata: {
        userId,
        items: enrichedItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1
        })),
      },
      additional_info: {
        items: enrichedItems.map(item => ({
          id: item.id,
          title: item.title,
          description: 'Curso',
          quantity: item.quantity,
          // Mercado Pago espera valores em reais, converter de centavos
          unit_price: item.price! / 100,
          category_id: 'curso',
          ...(item.imageUrl && { picture_url: item.imageUrl }),
        })),
      },
      statement_descriptor: "PROGRAMACAO.DEV",
      binary_mode: true,
    };

    // Log para debug
    console.log('Criando pagamento com método:', method);
    if (method === 'pix') {
      console.log('Dados do pagamento PIX:', {
        transaction_amount: calculatedTotalInReais,
        payer_email: payer.email,
        payer_cpf: payer.cpf?.replace(/\D/g, ''),
      });
    }

    let response;
    try {
      response = await payment.create({
        body: mpData as any,
        requestOptions: {
          idempotencyKey: crypto.randomUUID(),
          meliSessionId: req.headers.get('X-meli-session-id')!
        }
      });
      
      console.log('Resposta do Mercado Pago:', {
        id: response.id,
        status: response.status,
        payment_method_id: response.payment_method_id,
        has_point_of_interaction: !!response.point_of_interaction
      });
    } catch (mpError: any) {
      console.error('Erro ao criar pagamento no Mercado Pago:', mpError);
      console.error('Detalhes do erro:', {
        message: mpError.message,
        cause: mpError.cause,
        status: mpError.status,
        statusCode: mpError.statusCode
      });
      return NextResponse.json(
        {
          error: "Erro ao processar pagamento no gateway",
          details: process.env.NODE_ENV === 'development' ? mpError.message : undefined
        },
        { status: 500 }
      );
    }

    if (!response?.id) {
      console.error('Resposta do Mercado Pago sem ID:', response);
      return NextResponse.json(
        { error: "Falha ao processar pagamento no gateway" },
        { status: 500 }
      );
    }

    const mpPaymentId = response.id?.toString()!;

    // Create payment record and enroll user in courses
    await prisma.$transaction([
      // Create payment record
      prisma.payment.create({
        data: {
          userId,
          mpPaymentId: response.id.toString(),
          status: response.status || 'pending',
          amount: calculatedTotalInCents,
          metadata: {
            paymentMethod: method,
            installments: method !== 'pix' ? installments : 1,
          },
          items: {
            create: enrichedItems.map(item => ({
              courseId: item.id,
              price: item.price,
              quantity: item.quantity,
              title: item.title,
              description: item.description || `Curso: ${item.title}`,
            })),
          },
        },
      }),
      
      // Enroll user in courses
      ...enrichedItems.map(item => 
        prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId: item.id,
            },
          },
          create: {
            userId,
            courseId: item.id,
            startDate: new Date(),
          },
          update: {},
        })
      ),
      
      // Clear user's cart after successful purchase
      prisma.cartItem.deleteMany({
        where: {
          cart: { userId },
          courseId: { in: courseIds },
        },
      }),
    ]);

    return NextResponse.json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      point_of_interaction: response.point_of_interaction,
    });

  } catch (err) {
    console.error('Erro ao processar pagamento:', err);
    return NextResponse.json(
      { error: "Erro ao processar pagamento", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}