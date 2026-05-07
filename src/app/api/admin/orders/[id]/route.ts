import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { jwtVerify } from "jose";

const UpdateOrderSchema = z.object({
  paymentStatus: z.enum(['PENDING','PAID','PROCESSING','SHIPPED','COMPLETED','CANCELLED']).optional(),
});

// PUT: Update order status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin JWT
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await req.json();
    const data = UpdateOrderSchema.parse(body);

    // Get order with user info
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: data,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create notification if status changed
    if (data.paymentStatus && data.paymentStatus !== existingOrder.paymentStatus) {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = 'INFO';

      switch (data.paymentStatus) {
        case 'PROCESSING':
          notificationTitle = 'Pesanan Sedang Diproses';
          notificationMessage = `Pesanan #${order.id} sedang dikemas dan akan segera dikirim.`;
          notificationType = 'INFO';
          break;
        case 'SHIPPED':
          notificationTitle = 'Pesanan Telah Dikirim';
          notificationMessage = `Pesanan #${order.id} telah dikirim dan sedang dalam perjalanan ke alamat Anda.`;
          notificationType = 'SUCCESS';
          break;
        case 'COMPLETED':
          notificationTitle = 'Pesanan Selesai';
          notificationMessage = `Pesanan #${order.id} telah selesai. Terima kasih atas pembelian Anda!`;
          notificationType = 'SUCCESS';
          break;
        case 'CANCELLED':
          notificationTitle = 'Pesanan Dibatalkan';
          notificationMessage = `Pesanan #${order.id} telah dibatalkan oleh admin. Dana akan dikembalikan dalam 3-5 hari kerja.`;
          notificationType = 'ERROR';
          break;
      }

      if (notificationMessage) {
        console.log('[Order Update] Creating notification for userId:', order.userId, 'orderID:', order.id, 'status:', data.paymentStatus);
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
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE: Cancel order (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin JWT
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'CANCELLED' },
      include: { user: true }
    });

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Pesanan Dibatalkan',
        message: `Pesanan #${order.id} telah dibatalkan. Jika ada pertanyaan, silakan hubungi customer service kami.`,
        type: 'ERROR',
        orderId: order.id
      }
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
