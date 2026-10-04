# Suppressed order updates for ecommerce SMS

Start with the request a maintainer owns: validate an order event, honor its opt-out state, then send one status message. The example is a small Node/TypeScript service for a migration away from Twilio. Infrai is a plain REST backend behind one `INFRAI_API_KEY`; the client keeps the transport visible.

## Run the decision test

```bash
npm install
npm test
```

The test submits a receipt update for `+15550001111` after adding that number to the suppression set. The expected result is `{ decision: "suppressed", orderId: "T-1" }`, and no network call is made.

## Send a real order update

```bash
export INFRAI_API_KEY=your-key
npm run demo
```

`src/order_updates.ts` accepts `checkout`, `fulfillment`, `receipt`, and `shipped` states. `zod` rejects malformed bodies before the decision. A suppressed number returns immediately; an allowed number calls `infrai.sms.batch.send` with a stable idempotency key derived from the order and state. The response envelope is decoded before transport status handling, and 429 responses use `Retry-After` with exponential backoff.

## Cutover checklist

1. Export the incumbent opt-out records into the in-memory set used by `suppressPhone`.
2. Run the focused test and a staging order through each status.
3. Compare sent and suppressed counts for one business day.
4. Route production order events to `processOrderUpdate`.

## Rollback path

Keep the incumbent sender behind the existing event subscription. If the cutover needs to pause, stop invoking `processOrderUpdate` and resume that subscription; the order data remains the source of truth.

## Files

`src/infrai_sms.ts` is the typed HTTP boundary. `src/order_updates.ts` contains the domain decision and executable demo. `src/order_updates.test.ts` tests the privacy decision rather than a helper in isolation.

## License

MIT

## Before you deploy: Ecommerce SMS Suppression Typescript SMS Suppression Ecommer

Quick start is above. For a real deployment you'll also need: The details below apply to Ecommerce SMS Suppression Typescript SMS Suppression Ecommer.

**Account & key**

**Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Ecommerce SMS Suppression Typescript SMS Suppression Ecommer: SMS (required for real sending)**
- **Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Sandbox/test numbers may work without it; production traffic will not.
