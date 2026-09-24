"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "../../lib/supabase/client";
import { cloudConfigured, ensureCustomerSession } from "../../lib/cloud-session";

type AccountState = "loading" | "signed-out" | "guest" | "email";

export default function AccountAccess() {
  const [client] = useState(() => (cloudConfigured() ? createClient() : null));
  const [state, setState] = useState<AccountState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) {
      setState("signed-out");
      return;
    }
    let cancelled = false;
    void client.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setState(!data.user ? "signed-out" : data.user.is_anonymous ? "guest" : "email");
      if (data.user?.email) setEmail(data.user.email);
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function startGuestSession() {
    if (!client || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await ensureCustomerSession(client);
      setState("guest");
      setMessage("Private guest session ready on this device.");
    } catch {
      setMessage("A private session could not be started. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (state === "guest") {
        const signedOut = await client.auth.signOut();
        if (signedOut.error) throw signedOut.error;
        setState("signed-out");
      }
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error || !result.data.user) throw result.error ?? new Error();
      setPassword("");
      setState("email");
      setMessage("Signed in. Your cloud-saved requests are available on this account.");
    } catch {
      setMessage("Sign-in failed. Check the email and password for your authorised test account.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!client || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await client.auth.signOut();
      if (result.error) throw result.error;
      setState("signed-out");
      setPassword("");
      setMessage("Signed out on this device.");
    } catch {
      setMessage("Sign-out could not be confirmed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!client) {
    return <p>Cloud accounts are not configured for this deployment.</p>;
  }

  return (
    <div className="account-group">
      <div className="account-row">
        <span>
          <strong>{state === "email" ? "Signed-in account" : state === "guest" ? "Private guest session" : "Not signed in"}</strong>
          <small>{state === "email" ? email : state === "guest" ? "Saved items stay private to this browser session." : "Start a guest session or use an authorised test account."}</small>
        </span>
      </div>
      {state === "signed-out" && (
        <button className="service-card-button" type="button" disabled={busy} onClick={() => void startGuestSession()}>
          {busy ? "Starting…" : "Start private guest session"}
        </button>
      )}
      {state !== "email" && (
        <form className="request-form" onSubmit={signIn}>
          <label htmlFor="account-email">Email</label>
          <input id="account-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="account-password">Password</label>
          <input id="account-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="service-card-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
      )}
      {(state === "guest" || state === "email") && (
        <button className="service-card-button service-card-button-secondary" type="button" disabled={busy} onClick={() => void signOut()}>
          Sign out
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
