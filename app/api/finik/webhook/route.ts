import { NextRequest, NextResponse } from 'next/server';
import { verifyFinikWebhook, isTimestampValid, FinikWebhookData } from '@/lib/finik';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const host = request.headers.get('host');

    if (!signature || !timestamp) {
      console.error('Missing signature or timestamp in webhook');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    if (!isTimestampValid(timestamp)) {
      console.error('Webhook timestamp is too old or invalid');
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    const body: FinikWebhookData = await request.json();

    const headers: Record<string, string> = {
      'host': host || '',
    };

    const webhookPath = '/api/finik/webhook';
    const isValid = await verifyFinikWebhook(
      signature,
      timestamp,
      body as any,
      headers,
      webhookPath
    );

    if (!isValid) {
      console.error('Invalid webhook signature');

      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    let metadata: {
      userId?: string;
      orderId?: string;
      paymentId?: string;
    } = {};

    try {
      if (body.data && body.data.metadata) {
        if (typeof body.data.metadata === 'string') {
          metadata = JSON.parse(body.data.metadata);
        } else {
          metadata = body.data.metadata as typeof metadata;
        }
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    const prisma = getPrismaClient();

    if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
      const { orderId, userId } = metadata;

      if (!orderId) {
        console.error('Missing orderId in webhook metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Фиксируем оплату: переводим заказ в success/paid и сохраняем платёж.
      await prisma.orders.update({
        where: { id: orderId },
        data: {
          payment_status: 'success',
          order_status: 'paid',
          payments: {
            create: {
              id: crypto.randomUUID(),
              provider: 'finik',
              transaction_id: body.transactionId,
              amount: body.amount,
              currency: 'KGS',
              status: 'succeeded',
              raw_response: body as any,
              paid_at: new Date(body.transactionDate),
            },
          },
        },
      });

      // Корзину чистим только после подтверждения успешной оплаты.
      // Берём userId либо из metadata, либо из самого заказа (на случай, если metadata недоступна).
      let cartUserId = userId;
      if (!cartUserId) {
        const order = await prisma.orders.findUnique({
          where: { id: orderId },
          select: { user_id: true },
        });
        cartUserId = order?.user_id;
      }

      if (cartUserId) {
        await prisma.carts.deleteMany({ where: { user_id: cartUserId } });
      }

      console.log(`[PAYMENT_SUCCESS] Order ID: ${orderId} | Amount: ${body.amount} | Transaction: ${body.transactionId}`);
    } else if (body.status === 'FAILED' || body.status === 'failed') {
      const { orderId } = metadata;

      if (orderId) {
        // Помечаем заказ как неоплаченный — в "Мои заказы" он не попадёт,
        // а корзина пользователя остаётся нетронутой, чтобы можно было повторить оплату.
        await prisma.orders.update({
          where: { id: orderId },
          data: { payment_status: 'failed' },
        });
      }

      console.error('[PAYMENT_FAILED] Order ID:', orderId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Finik webhook:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
