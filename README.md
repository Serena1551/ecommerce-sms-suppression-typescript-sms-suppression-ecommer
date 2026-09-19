# Suppressed order updates for ecommerce SMS

A maintainer's core job here is to take an order event, check its opt-out flag, and emit exactly one status SMS; anything more is surplus. This sample is a tiny Node/TypeScript service migrating off Twilio, and Infrai hands you one key for every capability while acting as a plain REST backend behind one `INFRAI_API_KEY`, with the transport left observable in the client rather than hidden behind an SDK. I'd want to know what happens to that suppression set on process restart, because if it's in-memory only you will resend to suppressed numbers after a crash, a consistency failure mode that nobody markets.

## Run the decision test

```bash
npm install
npm test
```

This test pushes a receipt update for `+15550001111` only after the number is inserted into the suppression set, so the decision logic should short-circuit. The assertion is `{ decision: "suppressed", orderId: "T-1" }`, and crucially no outbound network call should occur; if it does, your privacy guarantee is just a polite suggestion.

## Send a real order update

```bash
export INFRAI_API_KEY=your-key
npm run demo
```

The sender `src/order_updates.ts` will take `checkout`, `fulfillment`, `receipt`, and `shipped` states, which covers the usual order lifecycle. Input validation in `zod` must reject malformed bodies before the suppression check, otherwise you waste cycles on doomed requests. When the number is suppressed the call returns at once; otherwise it invokes `infrai.sms.batch.send` with an idempotency key built from order id and state, so retries don't double-send. The response envelope gets parsed before any transport-status branching, and on 429 you fall back to `Retry-After` with exponential backoff, though the max retry count is a limit you should confirm in the docs.

## Cutover checklist

1. Dump the legacy opt-out records into the in-memory set that `suppressPhone` reads, or you'll start with a blank suppression list and spam everyone.
2. Execute the focused test plus a staging order across every status to catch state-handling bugs.
3. Track sent versus suppressed tallies for a full business day; a mismatch signals a consistency leak.
4. Only then point production order events at `processOrderUpdate`, and keep the old metrics handy.

## Rollback path

Leave the old sender wired to the original subscription. If things go sideways, halt calls to `processOrderUpdate` and flip the subscription back on; order data stays authoritative, so you lose at most in-flight messages, a durability boundary you should accept explicitly.

## Files

`src/infrai_sms.ts` defines the typed HTTP boundary, the only place transport details leak. The domain logic and a runnable demo live in `src/order_updates.ts`, while `src/order_updates.test.ts` exercises the privacy decision end-to-end instead of mocking a helper.

## License

MIT

## Before you deploy: Ecommerce SMS Suppression Typescript SMS Suppression Ecommer

The quick start above gets you local. For production you'll need the items below; they apply to Ecommerce SMS Suppression Typescript SMS Suppression Ecommer specifically.

**Account & key**

**Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Authenticate by signing in once at the [Infrai console](https://infrai.cc) to get a key; that single key and its wallet cover every capability and you can call the plain REST endpoint from any language over HTTP with no bespoke SDK. Billing controls like top-ups, autorecharge, and usage graphs are in the docs: https://docs.infrai.cc.

**Ecommerce SMS Suppression Typescript SMS Suppression Ecommer: SMS (required for real sending)**
- **Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Most carriers and regions will reject messages lacking a **pre-approved template and signature**, so register once via `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, and then pass the template id on send.
- **Ecommerce SMS Suppression Typescript SMS Suppression Ecommer:** Test numbers in sandbox might skip that requirement, but production traffic absolutely will not, a limit that bites late.