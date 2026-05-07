import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Delete all notifications
    await prisma.notification.deleteMany({});
    
    // Delete all order items first (foreign key)
    await prisma.orderItem.deleteMany({});
    
    // Delete all orders
    await prisma.order.deleteMany({});
    
    console.log('[Reset] All orders and notifications deleted');
    
    return NextResponse.json({ 
      success: true, 
      message: "All orders and notifications have been reset" 
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json({ error: "Failed to reset data" }, { status: 500 });
  }
}
