import assert from "node:assert/strict";
import test from "node:test";
import { readChatSession } from "./chat-session.ts";

test("restores conversation and matching context", () => {
  const session = { messages: [{ role: "user", text: "housing", time: "12:30 pm" }], context: { need: "housing", postcode: "2541", matches: ["nsw-housing-nowra"] } };
  assert.equal(readChatSession(JSON.stringify(session))?.context.postcode, "2541");
});
test("corrupt or unexpected session data cannot crash chat rendering", () => {
  for (const value of ["invalid", "null", "{}", JSON.stringify({ messages: [{ role: "bot", text: "hi", time: {} }], context: {} }), JSON.stringify({ messages: [null], context: {} })]) assert.equal(readChatSession(value), undefined);
});
test("limits restored history while keeping recent messages", () => {
  const messages = Array.from({ length: 100 }, (_, i) => ({ role: "user", text: String(i) }));
  const session = readChatSession(JSON.stringify({ messages, context: {} }));
  assert.equal(session?.messages.length, 80);
  assert.equal(session?.messages[0].text, "20");
});
