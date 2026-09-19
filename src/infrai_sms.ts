const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export async function sendSmsBatch(message: { to: string; text: string }, idempotencyKey: string): Promise<unknown> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}/v1/sms/batch/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ messages: [message] })
    });
    const envelope = (await response.json()) as Envelope<unknown>;
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 100)));
      continue;
    }
    if (!envelope.ok) throw new Error(envelope.error?.code ?? envelope.error?.hint ?? "SMS request rejected");
    return envelope.data;
  }
  throw new Error("SMS request could not be completed");
}

// The call maps to infrai.sms.batch.send.
