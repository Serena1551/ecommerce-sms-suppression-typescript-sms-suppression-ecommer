import assert from "node:assert/strict";
import { processOrderUpdate, suppressPhone } from "./order_updates.js";

suppressPhone("+15550001111");
const result = await processOrderUpdate({ orderId: "T-1", phone: "+15550001111", status: "receipt" });
assert.deepEqual(result, { decision: "suppressed", orderId: "T-1" });
console.log("suppression decision: passed");
