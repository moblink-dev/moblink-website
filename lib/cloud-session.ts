import type { SupabaseClient } from "./supabase/client.ts";

export function cloudConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function ensureCustomerSession(client: SupabaseClient) {
  const current = await client.auth.getUser();
  if (current.error) throw current.error;
  if (current.data.user) return current.data.user;

  const signed = await client.auth.signInAnonymously();
  if (signed.error || !signed.data.user) {
    throw signed.error ?? new Error("Unable to create a private MobLink session");
  }
  return signed.data.user;
}
