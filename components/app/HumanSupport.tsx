"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  prepareSupportHistory,
  supportConfigured,
  type SupportHistory,
  type SupportMessage,
  type SupportTeam,
} from "../../lib/support-chat";

export default function HumanSupport({
  team = "moblink",
  history,
  initialLocation = "",
}: {
  team?: SupportTeam;
  history: SupportHistory;
  initialLocation?: string;
}) {
  const [client] = useState(() =>
    supportConfigured() ? createClient() : null,
  );
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState(initialLocation);
  const [consent, setConsent] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const feed = useRef<HTMLDivElement>(null);
  const pendingMessage = useRef<{ id: string; body: string } | null>(null);
  const pendingConversation = useRef(crypto.randomUUID());
  const organisation = team === "moblink" ? "MobLink" : "IRAAC";

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    async function restore() {
      const { data } = await client!.auth.getUser();
      if (!data.user || cancelled) return;
      const result = await client!
        .from("support_conversations")
        .select("id")
        .eq("customer_id", data.user.id)
        .eq("team", team)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && result.data) setConversationId(result.data.id);
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, [client, team]);

  useEffect(() => {
    if (!client || !conversationId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      const result = await client!
        .from("support_messages")
        .select("id,conversation_id,kind,body,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (stopped) return;
      if (result.error)
        setConnectionError("Messages couldn’t refresh. Reconnecting…");
      else {
        setMessages((result.data ?? []).reverse());
        setConnectionError("");
      }
      timer = setTimeout(refresh, result.error ? 15000 : 3000);
    }
    void refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [client, conversationId]);
  useEffect(() => {
    if (feed.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [messages.length]);

  async function connect() {
    if (!client || busy || !consent || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      let {
        data: { user },
      } = await client.auth.getUser();
      if (!user) {
        const signed = await client.auth.signInAnonymously();
        if (signed.error || !signed.data.user) throw new Error();
        user = signed.data.user;
      }
      const id = pendingConversation.current;
      const result = await client
        .from("support_conversations")
        .insert({
          id,
          customer_id: user.id,
          team,
          customer_name: name.trim(),
          location: location.trim(),
          assistant_history: prepareSupportHistory(history),
        });
      if (result.error) {
        if (result.error.code !== "23505") throw new Error();
        const existing = await client
          .from("support_conversations")
          .select("id")
          .eq("id", id)
          .eq("customer_id", user.id)
          .eq("team", team)
          .single();
        if (!existing.data) throw new Error();
      }
      setConversationId(id);
    } catch {
      setError(
        "We couldn’t connect to the support inbox. Your conversation has not been confirmed as received. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    if (!client || !conversationId || !input.trim() || busy) return;
    setBusy(true);
    setError("");
    const body = input.trim();
    const pending =
      pendingMessage.current?.body === body
        ? pendingMessage.current
        : { id: crypto.randomUUID(), body };
    pendingMessage.current = pending;
    try {
      const result = await client
        .from("support_messages")
        .insert({
          id: pending.id,
          conversation_id: conversationId,
          kind: "customer",
          body,
        });
      if (result.error) {
        if (result.error.code !== "23505") throw new Error();
        const existing = await client
          .from("support_messages")
          .select("id")
          .eq("id", pending.id)
          .eq("conversation_id", conversationId)
          .eq("body", body)
          .eq("kind", "customer")
          .single();
        if (!existing.data) throw new Error();
      }
      setInput("");
      pendingMessage.current = null;
    } catch {
      setError(
        "Message not confirmed as sent. Your draft is kept here; please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!client)
    return (
      <div className="human-support-unavailable">
        <span className="human-support-icon" aria-hidden="true">
          ♧
        </span>
        <h2>{organisation} human support</h2>
        <p>
          This channel is for a real {organisation} staff member. The support
          inbox is not connected yet.
        </p>
        <p>
          Your assistant conversation is kept here. No message has been sent to
          a person.
        </p>
        <p>
          Use the assistant tab to continue while live support is being set up.
        </p>
      </div>
    );
  return (
    <div className="human-support-session">
      <div
        className="human-support-feed"
        ref={feed}
        role="log"
        aria-label={`${organisation} human messages`}
      >
        {!conversationId ? (
          <div className="human-support-intake">
            <h2>Talk with the {organisation} team</h2>
            <p>
              Share this assistant conversation and the location you enter below
              with the team. A staff member will reply here when available.
            </p>
            <label>
              Your name
              <input
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Suburb or postcode (optional)
              <input
                value={location}
                maxLength={200}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label className="support-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I agree to share this conversation and these details with{" "}
              {organisation} support.
            </label>
            <button
              className="support-action"
              disabled={busy || !consent || !name.trim()}
              onClick={connect}
            >
              {busy ? "Connecting…" : "Start human chat"}
            </button>
          </div>
        ) : (
          <>
            <p className="provider-demo-note">
              {messages.some((m) => m.kind === "staff")
                ? `${organisation} staff replies appear here.`
                : `Your request is in the ${organisation} inbox. Waiting for a staff reply.`}{" "}
              You can switch back to the assistant at any time.
            </p>
            {messages.map((item) => (
              <article
                className={`mobile-message ${item.kind === "customer" ? "user" : "assistant"}`}
                key={item.id}
              >
                <strong>
                  {item.kind === "staff" ? `${organisation} staff` : "You"}
                </strong>
                <p>{item.body}</p>
                <time>
                  {new Date(item.created_at).toLocaleTimeString("en-AU", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </article>
            ))}
          </>
        )}
      </div>
      {(error || connectionError) && (
        <p role="alert" className="support-error">
          {error || connectionError}
        </p>
      )}
      {conversationId && (
        <form
          className="mobile-chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            aria-label={`Message ${organisation} staff`}
            placeholder={`Message ${organisation} staff…`}
            maxLength={2000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            disabled={busy || !input.trim()}
            aria-label="Send to human support"
          >
            ↑
          </button>
        </form>
      )}
    </div>
  );
}
