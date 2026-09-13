import test from "node:test";
import assert from "node:assert/strict";
import { prepareSupportHistory } from "./support-chat.ts";

test("untrusted shared history cannot crash staff rendering", () => {
  assert.deepEqual(
    prepareSupportHistory([
      null,
      {},
      { role: {}, text: "bad" },
      { role: "Customer", text: "Housing" },
    ]),
    [{ role: "Customer", text: "Housing" }],
  );
  assert.deepEqual(prepareSupportHistory("invalid"), []);
});
test("handover includes only bounded text and no hidden fields", () => {
  const history = prepareSupportHistory(
    Array.from({ length: 100 }, () => ({
      role: "Customer",
      text: "x".repeat(2500),
      secret: "not shared",
    })),
  );
  assert.equal(history.length, 80);
  assert.equal(history[0].text.length, 2000);
  assert.deepEqual(Object.keys(history[0]), ["role", "text"]);
});
