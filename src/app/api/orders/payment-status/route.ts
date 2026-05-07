import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdatePaymentSchema = z.object({
  orderId: z.number(),
  paymentStatus: z.enum(['PENDING','PAID','PROCESSING','SHIPPED','COMPLETED','CANCELLED'])
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const data = UpdatePaymentSchema.parse(json)

    // Update order status
    const order = await prisma.order.update({
      where: { id: data.orderId },
      data: { paymentStatus: data.paymentStatus },
      include: { user: true }
    })

    // Create notification based on status change
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'INFO';

    switch (data.paymentStatus) {
      case 'PAID':
        notificationTitle = 'Pembayaran Berhasil';
        notificationMessage = `Pembayaran untuk pesanan #${order.id} telah dikonfirmasi dan sedang dalam proses pengemasan.`;
        notificationType = 'SUCCESS';
        
        // Auto-update to PROCESSING
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PROCESSING' }
        });
        break;
      case 'PROCESSING':
        notificationTitle = 'Pesanan Sedang Diproses';
        notificationMessage = `Pesanan #${order.id} sedang dikemas dan akan segera dikirim.`;
        notificationType = 'INFO';
        break;
      case 'SHIPPED':
        notificationTitle = 'Pesanan Telah Dikirim';
        notificationMessage = `Pesanan #${order.id} telah dikirim dan sedang dalam perjalanan.`;
        notificationType = 'SUCCESS';
        break;
      case 'COMPLETED':
        notificationTitle = 'Pesanan Selesai';
        notificationMessage = `Pesanan #${order.id} telah selesai. Terima kasih atas pembelian Anda!`;
        notificationType = 'SUCCESS';
        break;
      case 'CANCELLED':
        notificationTitle = 'Pesanan Dibatalkan';
        notificationMessage = `Pesanan #${order.id} telah dibatalkan. Silakan hubungi kami jika ada pertanyaan.`;
        notificationType = 'WARNING';
        break;
    }

    // Create notification if message exists
    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          orderId: order.id
        }
      });
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
