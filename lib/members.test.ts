import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import { demoMembers, getMembers, recordMemberCheckIn } from "./members.ts";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  clear() { this.values.clear(); }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });

beforeEach(() => storage.clear());

test("loads a fictional IRAAC member population with all four programs represented", () => {
  const members = getMembers();
  const programs = new Set(members.flatMap((member) => member.programs));

  assert.equal(members.length, demoMembers.length);
  assert.ok(members.length >= 12);
  assert.deepEqual([...programs].sort(), ["DARC", "MCC", "The Crew", "YouthScape"]);
  assert.ok(members.every((member) => member.name.includes("(demo)")));
});

test("records a member check-in without exposing a full phone number", () => {
  const member = getMembers()[0];
  const updated = recordMemberCheckIn(member.id, "phone", "Member is safe and would like a program update.");

  assert.equal(updated?.activities.at(-1)?.type, "phone");
  assert.match(updated?.activities.at(-1)?.summary ?? "", /safe/);
  assert.match(updated?.phoneMasked ?? "", /•/);
  assert.equal(getMembers().find((item) => item.id === member.id)?.activities.length, member.activities.length + 1);
});

test("falls back to fresh demo members when stored data is malformed", () => {
  storage.setItem("moblink_iraac_members_v1", JSON.stringify([{ id: "partial", name: "Broken", phoneMasked: "04••", programs: [], activities: [] }]));
  const first = getMembers();
  first[0].programs.push("Changed" as never);

  assert.equal(getMembers().length, demoMembers.length);
  assert.ok(!getMembers()[0].programs.includes("Changed" as never));
});
