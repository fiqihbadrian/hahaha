import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { createInvoice } from '@/lib/xendit'

const CreateOrderSchema = z.object({
  userId: z.number(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().min(1) }))
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Jika ada userId, filter by userId (untuk profile page)
    if (userId) {
      const orders = await prisma.order.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Format response untuk profile page
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        totalCents: order.totalCents,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      }));

      return NextResponse.json(formattedOrders);
    }

    // Jika tidak ada userId, return semua orders (untuk admin)
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        items: {
          include: {
            product: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const data = CreateOrderSchema.parse(json)

    // Fetch products and compute totals
    const productIds = data.items.map(i => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

    const byId = new Map(products.map(p => [p.id, p]))

    let totalCents = 0
    const orderItems = data.items.map(i => {
      const p = byId.get(i.productId)
      if (!p) throw new Error(`Product ${i.productId} not found`)
      const priceCents = p.priceCents
      totalCents += priceCents * i.quantity
      return { productId: i.productId, quantity: i.quantity, priceCents }
    })

    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        totalCents,
        paymentStatus: 'PENDING',
        items: { create: orderItems }
      }
    })

    const invoice = await createInvoice({ orderId: order.id, amountCents: totalCents })

    await prisma.order.update({
      where: { id: order.id },
      data: { invoiceId: invoice.invoiceId }
    })

    return NextResponse.json({ orderId: order.id, invoice })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
