// Simple Xendit sandbox simulator
export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED'


export async function createInvoice({ orderId, amountCents }:{ orderId: number, amountCents: number }) {
  // Simulate creation
  const invoiceId = `inv_${orderId}_${Date.now()}`
  const paymentUrl = `https://sandbox.xendit.co/pay/${invoiceId}`
  return { invoiceId, paymentUrl, status: 'PENDING' as InvoiceStatus }
}

export async function simulateStatusUpdate(invoiceId: string, status: InvoiceStatus) {
  return { invoiceId, status }
}
// ahhh atas bawah cantik