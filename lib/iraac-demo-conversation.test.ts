import test from "node:test";
import assert from "node:assert/strict";
import {
  iraacDemoConversation,
  upgradeYouthscapeConversation,
} from "./iraac-demo-conversation.ts";

test("YouthScape uses the shared Jayden scenario with distinct assistant and human exchanges", () => {
  assert.ok(iraacDemoConversation.length >= 16);
  assert.ok(
    iraacDemoConversation.some(
      (m) => m.mode === "advisor" && m.sender === "provider",
    ),
  );
  assert.ok(
    iraacDemoConversation.some(
      (m) => m.mode === "assistant" && /Wollongong/.test(m.body),
    ),
  );
  assert.ok(
    iraacDemoConversation.every((m) => m.senderName !== "Moblink call centre"),
  );
});
test("upgrades the old demo without discarding messages added by the user or duplicating the story", () => {
  const extra = {
    id: "custom",
    sender: "community" as const,
    senderName: "Jayden",
    body: "My new question",
    createdAt: "2026-09-13T10:00:00Z",
  };
  const once = upgradeYouthscapeConversation([
    { ...extra, id: "msg_demo_1" },
    extra,
  ]);
  assert.equal(once.length, iraacDemoConversation.length + 1);
  assert.deepEqual(upgradeYouthscapeConversation(once), once);
  assert.equal(once.at(-1)?.body, extra.body);
});
