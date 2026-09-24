"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { cloudConfigured, ensureCustomerSession } from "../../lib/cloud-session";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfileImageUpload() {
  const [client] = useState(() => (cloudConfigured() ? createClient() : null));
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    void (async () => {
      const current = await client.auth.getUser();
      if (!current.data.user || cancelled) return;
      const path = `${current.data.user.id}/avatar`;
      const signed = await client.storage.from("profile-images").createSignedUrl(path, 3600);
      if (!cancelled && signed.data?.signedUrl) setImageUrl(signed.data.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function upload(file?: File) {
    if (!client || !file || busy) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setMessage("Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage("Choose an image smaller than 5 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const user = await ensureCustomerSession(client);
      const path = `${user.id}/avatar`;
      const result = await client.storage.from("profile-images").upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (result.error) throw result.error;
      const signed = await client.storage.from("profile-images").createSignedUrl(path, 3600);
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error();
      setImageUrl(signed.data.signedUrl);
      setMessage("Profile image saved privately in MobLink cloud storage.");
    } catch {
      setMessage("The image was not confirmed as uploaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!client) return null;

  return (
    <div className="account-group">
      {imageUrl && <img src={imageUrl} alt="Your MobLink profile" width={96} height={96} />}
      <label className="account-row">
        <span>
          <strong>{busy ? "Uploading…" : "Profile image"}</strong>
          <small>Private JPEG, PNG or WebP, up to 5 MB.</small>
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => void upload(event.target.files?.[0])} />
      </label>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
