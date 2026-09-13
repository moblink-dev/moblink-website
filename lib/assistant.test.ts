import assert from "node:assert/strict";
import test from "node:test";
import { services } from "../app/data.ts";
import { replyToMessage } from "./assistant.ts";

test("service requests containing hi or yo are not mistaken for greetings", () => {
  for (const text of ["I need housing", "can you help with youth support", "my child needs a doctor"]) {
    assert.ok(replyToMessage(services, text, {}).serviceIds.length > 0, text);
  }
});
test("remembers the need when the next message is a postcode", () => {
  const first = replyToMessage(services, "I need a lawyer", {});
  const second = replyToMessage(services, "2541", first.context);
  assert.equal(second.context.postcode, "2541");
  assert.ok(second.serviceIds.every(id => services.find(s => s.id === id)?.category === "Legal"));
});
test("does not invent local matches for a distant postcode", () => {
  const result = replyToMessage(services, "housing 6000", {});
  assert.ok(result.serviceIds.every(id => services.find(s => s.id === id)?.isNational));
});
test("service context answers eligibility and contact questions", () => {
  const context = { serviceId: "iraac-youthscape" };
  assert.match(replyToMessage(services, "am I eligible?", context).text, /Eligibility|eligibility/);
  assert.match(replyToMessage(services, "can I call them?", { serviceId: "als-nowra" }).text, /1800 733 233/);
});
test("human support never claims a live operator has been notified", () => {
  const result = replyToMessage(services, "talk to a person", {});
  assert.equal(result.humanSupport, true);
  assert.match(result.text, /does not notify/);
});
test("immediate danger takes precedence over service matching", () => {
  assert.match(replyToMessage(services, "I am in danger and need housing", {}).text, /000/);
});
test("unrecognised requests ask a question rather than inventing recommendations", () => {
  assert.equal(replyToMessage(services, "purple elephants", {}).serviceIds.length, 0);
});
test("understands a housing need expressed in everyday language", () => {
  const reply = replyToMessage(services, "I have nowhere to stay", {});
  assert.ok(reply.serviceIds.length > 0);
  assert.ok(reply.serviceIds.every(id => services.find(s => s.id === id)?.category === "Housing"));
});
test("can discuss the first service from the previous recommendations", () => {
  const first = replyToMessage(services, "legal help 2541", {});
  const next = replyToMessage(services, "how do I call the first one?", first.context);
  assert.equal(next.serviceIds[0], first.serviceIds[0]);
  assert.match(next.text, /Phone:/);
});
