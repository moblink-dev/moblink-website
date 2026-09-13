"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "../../../lib/supabase/client";
import {
  prepareSupportHistory,
  supportConfigured,
  type SupportConversation,
  type SupportMessage,
} from "../../../lib/support-chat";

export default function StaffSupportPage() {
  const [client] = useState(() =>
    supportConfigured() ? createClient() : null,
  );
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<{
    id: string;
    body: string;
    conversation: string;
  } | null>(null);
  const current = conversations.find((item) => item.id === selected);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    async function check() {
      const {
        data: { user },
      } = await client!.auth.getUser();
      if (!user) return;
      const result = await client!
        .from("support_staff")
        .select("team")
        .eq("user_id", user.id);
      if (!cancelled) setSignedIn(Boolean(result.data?.length));
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [client]);
  useEffect(() => {
    if (!client || !signedIn) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      const result = await client!
        .from("support_conversations")
        .select("id,team,customer_name,location,assistant_history,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (stopped) return;
      if (result.error) setError("Inbox refresh failed. Reconnecting…");
      else setConversations(result.data ?? []);
      timer = setTimeout(refresh, result.error ? 15000 : 3000);
    }
    void refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [client, signedIn]);
  useEffect(() => {
    if (!client || !signedIn || !selected) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    setMessages([]);
    setDraft("");
    pending.current = null;
    async function refresh() {
      const result = await client!
        .from("support_messages")
        .select("id,conversation_id,kind,body,created_at")
        .eq("conversation_id", selected)
        .order("created_at", { ascending: false })
        .limit(100);
      if (stopped) return;
      if (result.error) setError("Conversation refresh failed. Reconnecting…");
      else setMessages((result.data ?? []).reverse());
      timer = setTimeout(refresh, result.error ? 15000 : 3000);
    }
    void refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [client, signedIn, selected]);
  async function signIn() {
    if (!client || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error || !result.data.user)
        throw new Error("Sign-in failed. Check your staff credentials.");
      const membership = await client
        .from("support_staff")
        .select("team")
        .eq("user_id", result.data.user.id);
      if (!membership.data?.length) {
        await client.auth.signOut();
        throw new Error(
          "This account has not been assigned to a support team.",
        );
      }
      setPassword("");
      setSignedIn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function reply() {
    if (!client || busy || !draft.trim() || !selected) return;
    setBusy(true);
    setError("");
    const body = draft.trim();
    const conversation = selected;
    const message =
      pending.current?.body === body &&
      pending.current.conversation === conversation
        ? pending.current
        : { id: crypto.randomUUID(), body, conversation };
    pending.current = message;
    try {
      const result = await client
        .from("support_messages")
        .insert({
          id: message.id,
          conversation_id: conversation,
          kind: "staff",
          body,
        });
      if (result.error) {
        if (result.error.code !== "23505") throw new Error();
        const existing = await client
          .from("support_messages")
          .select("id")
          .eq("id", message.id)
          .eq("conversation_id", conversation)
          .eq("body", body)
          .eq("kind", "staff")
          .single();
        if (!existing.data) throw new Error();
      }
      setDraft("");
      pending.current = null;
    } catch {
      setError(
        "Reply not confirmed as sent. Your draft is kept; please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="staff-support-page">
      <header>
        <p className="app-kicker">MobLink · Staff workspace</p>
        <h1>Human support inbox</h1>
        <p>Customer conversations shared with your team.</p>
        {signedIn && (
          <button
            onClick={async () => {
              await client?.auth.signOut();
              setSignedIn(false);
              setConversations([]);
              setMessages([]);
              setSelected("");
            }}
          >
            Sign out
          </button>
        )}
      </header>
      {!client ? (
        <p>
          Live support is not configured. Connect the support database and
          authorised staff accounts to enable this inbox.
        </p>
      ) : !signedIn ? (
        <form
          className="staff-support-login"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn();
          }}
        >
          <label>
            Staff email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy}>Sign in</button>
        </form>
      ) : (
        <div className="staff-support-layout">
          <aside aria-label="Support conversations">
            {conversations.length === 0 && <p>No shared conversations yet.</p>}
            {conversations.map((item) => (
              <button
                disabled={busy}
                aria-pressed={selected === item.id}
                key={item.id}
                onClick={() => setSelected(item.id)}
              >
                <strong>{item.customer_name}</strong>
                <span>
                  {item.team === "iraac" ? "IRAAC" : "MobLink"} ·{" "}
                  {item.location || "Location not shared"}
                </span>
              </button>
            ))}
          </aside>
          <section>
            {!current ? (
              <p>Select a conversation to read and reply.</p>
            ) : (
              <>
                <h2>{current.customer_name}</h2>
                <p>
                  {current.location || "Location not shared"} · Shared by the
                  customer
                </p>
                <details open>
                  <summary>Assistant conversation shared with the team</summary>
                  {prepareSupportHistory(current.assistant_history).map(
                    (item, index) => (
                      <article className="support-history-message" key={index}>
                        <strong>{item.role}</strong>
                        <p>{item.text}</p>
                      </article>
                    ),
                  )}
                </details>
                <div role="log" aria-label="Customer and staff messages">
                  {messages.map((item) => (
                    <article
                      className={`mobile-message ${item.kind === "staff" ? "user" : "assistant"}`}
                      key={item.id}
                    >
                      <strong>
                        {item.kind === "staff"
                          ? "Staff"
                          : current.customer_name}
                      </strong>
                      <p>{item.body}</p>
                      <time>
                        {new Date(item.created_at).toLocaleString("en-AU")}
                      </time>
                    </article>
                  ))}
                </div>
                <form
                  className="mobile-chat-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void reply();
                  }}
                >
                  <input
                    aria-label="Staff reply"
                    placeholder="Reply as a human support worker…"
                    maxLength={2000}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button disabled={busy || !draft.trim()}>Send</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
      {error && (
        <p className="support-error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
