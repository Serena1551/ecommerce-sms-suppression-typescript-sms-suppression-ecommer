import { z } from "zod";
import { sendSmsBatch } from "./infrai_sms.js";

export const orderUpdateSchema = z.object({
  orderId: z.string().min(1),
  phone: z.string().min(7),
  status: z.enum(["checkout", "fulfillment", "receipt", "shipped"]),
  optedOut: z.boolean().default(false)
});

const suppressedPhones = new Set<string>();

export function suppressPhone(phone: string): void { suppressedPhones.add(phone); }

export type UpdateResult = { decision: "sent" | "suppressed"; orderId: string; messageId?: unknown };

export async function processOrderUpdate(input: unknown): Promise<UpdateResult> {
  const order = orderUpdateSchema.parse(input);
  if (order.optedOut || suppressedPhones.has(order.phone)) return { decision: "suppressed", orderId: order.orderId };
  const text = `Order ${order.orderId}: ${order.status}`;
  const messageId = await sendSmsBatch({ to: order.phone, text }, `order-update-${order.orderId}-${order.status}`);
  return { decision: "sent", orderId: order.orderId, messageId };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await processOrderUpdate({ orderId: "A-1042", phone: "+15551234567", status: "shipped" });
  console.log(result);
}
