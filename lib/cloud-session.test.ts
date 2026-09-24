import assert from "node:assert/strict";
import test from "node:test";
import { ensureCustomerSession } from "./cloud-session.ts";
import type { SupabaseClient } from "./supabase/client.ts";

function clientWithAuth(auth: Record<string, unknown>) {
  return { auth } as unknown as SupabaseClient;
}

test("starts an anonymous session when the browser is signed out", async () => {
  const anonymousUser = { id: "10000000-0000-0000-0000-000000000001" };
  let anonymousCalls = 0;
  const client = clientWithAuth({
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => {
      throw new Error("getUser should not run without a session");
    },
    signInAnonymously: async () => {
      anonymousCalls += 1;
      return { data: { user: anonymousUser }, error: null };
    },
  });

  assert.equal(await ensureCustomerSession(client), anonymousUser);
  assert.equal(anonymousCalls, 1);
});

test("reuses and validates an existing session", async () => {
  const existingUser = { id: "10000000-0000-0000-0000-000000000002" };
  let anonymousCalls = 0;
  const client = clientWithAuth({
    getSession: async () => ({ data: { session: { access_token: "test" } }, error: null }),
    getUser: async () => ({ data: { user: existingUser }, error: null }),
    signInAnonymously: async () => {
      anonymousCalls += 1;
      return { data: { user: null }, error: null };
    },
  });

  assert.equal(await ensureCustomerSession(client), existingUser);
  assert.equal(anonymousCalls, 0);
});

test("does not replace a broken existing session with a guest identity", async () => {
  const validationError = new Error("invalid existing session");
  const client = clientWithAuth({
    getSession: async () => ({ data: { session: { access_token: "test" } }, error: null }),
    getUser: async () => ({ data: { user: null }, error: validationError }),
    signInAnonymously: async () => ({ data: { user: null }, error: null }),
  });

  await assert.rejects(() => ensureCustomerSession(client), validationError);
});
