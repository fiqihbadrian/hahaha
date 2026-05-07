import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

// GET: Ambil semua notifikasi user
export async function GET(req: NextRequest) {
  try {
    // Verify JWT
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;
    const userIdNum = parseInt(userId);

    console.log('[Notifications] Fetching for userId:', userIdNum, 'email:', payload.email);

    // Get user notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: userIdNum },
      orderBy: { createdAt: "desc" },
    });

    console.log('[Notifications] Found', notifications.length, 'notifications for userId:', userIdNum);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST: Buat notifikasi baru (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, message, type, orderId } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "INFO",
        orderId: orderId || null,
      },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// PATCH: Mark notification as read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
