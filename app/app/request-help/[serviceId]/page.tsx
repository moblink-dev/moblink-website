"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { services } from "../../../data";
import { createReferral, saveReferral, needCategories, type PreferredContact } from "../../../../lib/referrals";
import { saveCloudReferral } from "../../../../lib/cloud-referrals";
import { cloudConfigured } from "../../../../lib/cloud-session";
import BottomNav from "../../../../components/app/BottomNav";
import { useProviderServices } from "../../../../lib/provider-services";

export default function RequestHelpPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.serviceId as string;
  const [submitted, setSubmitted] = useState(false);
  const [createdReferralId, setCreatedReferralId] = useState("");
  const [cloudSaved, setCloudSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const catalogue = useProviderServices(services);
  const [form, setForm] = useState({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    postcode: "2541",
    needCategory: "Other",
    message: "",
    serviceId: "general",
    serviceName: "General support",
    consentToFollowUp: false,
    preferredContact: "sms" as PreferredContact,
  });

  const [service, setService] = useState<typeof services[0] | null>(null);

  useEffect(() => {
    if (serviceId) {
      const found = catalogue.find((s) => s.id === serviceId);
      setService(found ?? null);
      if (found) {
        setService(found);
        setForm((f) => ({
          ...f,
          serviceId: found.id,
          serviceName: found.name,
        }));
      }
    }
  }, [serviceId, catalogue]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.consentToFollowUp || !service || busy) return;
    setBusy(true);
    setError("");
    const referral = createReferral({
      serviceId: form.serviceId,
      serviceName: form.serviceName,
      serviceCategory: service?.category || "Other",
      requesterName: form.requesterName,
      requesterPhone: form.requesterPhone,
      requesterEmail: form.requesterEmail,
      postcode: form.postcode,
      needCategory: form.needCategory,
      message: form.message,
      consentToFollowUp: form.consentToFollowUp,
      source: "app",
      preferredContact: form.preferredContact,
    });
    try {
      const saved = cloudConfigured() ? await saveCloudReferral(referral) : referral;
      saveReferral(saved);
      setCloudSaved(cloudConfigured());
      setCreatedReferralId(saved.id);
      setSubmitted(true);
    } catch {
      setError("Your request was not confirmed as saved. Please try again; nothing has been sent to the provider.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <main className="app-page">
        <div className="phone-shell">
          <div className="request-confirmed">
            <div className="request-confirmed-icon">✓</div>
            <h1>{cloudSaved ? "Request saved securely" : "Demo request saved"}</h1>
            <p>Your request for {service?.name || "the selected service"} is {cloudSaved ? "saved to your private MobLink cloud session" : "saved in this browser"}. Open the conversation to review your next step. The provider has not been contacted.</p>
            <p className="request-confirmed-detail">
              Reference: <strong>{createdReferralId.slice(0, 12)}</strong>
            </p>
            <div className="request-confirmed-actions">
              <button type="button" className="service-card-button" onClick={() => router.push(`/app/connected/${createdReferralId}`)}>
                Open conversation
              </button>
              <button
                type="button"
                className="service-card-button service-card-button-secondary"
                onClick={() => router.push("/app/search")}
              >
                Browse services
              </button>
            </div>
          </div>
          <BottomNav current="/app/search" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="phone-shell">
        <div className="detail-back">
          <a href={`/app/service/${serviceId}`} className="detail-back-link">
            ← Back to service
          </a>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">Moblink</p>
            <h1>Request help</h1>
          </div>
        </header>

        {service && (
          <div className="request-service-ref">
            <strong>Requesting help with:</strong>
            <p>{service.name}</p>
          </div>
        )}


        {!service ? <p role="status">This service is not available. <a href="/app/search">Explore other support</a>.</p> : <form onSubmit={handleSubmit} className="request-form">
          {error && <p role="alert">{error}</p>}
          <div className="admin-banner admin-banner-soft">
            <div>
              <strong>Prototype: use fictional details only.</strong>
              <p>{cloudConfigured() ? "This staged screen saves to your private cloud session." : "This screen saves requests in this browser."} It does not contact a real service yet.</p>
            </div>
          </div>
          <div className="request-form-group">
            <label htmlFor="requesterName">Your name *</label>
            <input
              id="requesterName"
              type="text"
              required
              placeholder="e.g. Jane Smith"
              value={form.requesterName}
              onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
            />
          </div>

          <div className="request-form-group">
            <label htmlFor="requesterPhone">Phone number *</label>
            <input
              id="requesterPhone"
              type="tel"
              required
              placeholder="e.g. 04xx xxx xxx"
              value={form.requesterPhone}
              onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
            />
          </div>

          <div className="request-form-group">
            <label htmlFor="postcode">Postcode *</label>
            <input
              id="postcode"
              type="text"
              inputMode="numeric"
              required
              pattern="[0-9]{4}"
              placeholder="e.g. 2541"
              value={form.postcode}
              onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            />
          </div>

          <div className="request-form-group">
            <label htmlFor="requesterEmail">Email (optional)</label>
            <input
              id="requesterEmail"
              type="email"
              placeholder="e.g. jane@example.com"
              value={form.requesterEmail}
              onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
            />
          </div>

          <div className="request-form-group">
            <label htmlFor="preferredContact">How should the service contact you?</label>
            <select
              id="preferredContact"
              value={form.preferredContact}
              onChange={(e) => setForm({ ...form, preferredContact: e.target.value as PreferredContact })}
            >
              <option value="sms">Text message</option>
              <option value="phone">Phone call</option>
              <option value="in_app">Moblink chat</option>
            </select>
          </div>

          <div className="request-form-group">
            <label htmlFor="needCategory">What kind of help do you need?</label>
            <select
              id="needCategory"
              value={form.needCategory}
              onChange={(e) => setForm({ ...form, needCategory: e.target.value })}
            >
              {needCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="request-form-group">
            <label htmlFor="message">Tell us what you need help with</label>
            <textarea
              id="message"
              rows={4}
              placeholder="Briefly describe what you're looking for help with..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="request-form-group request-form-checkbox">
            <label>
              <input
                type="checkbox"
                required
                checked={form.consentToFollowUp}
                onChange={(e) => setForm({ ...form, consentToFollowUp: e.target.checked })}
              />
              <span>Moblink may share these details with this service so they can follow up about this request</span>
            </label>
          </div>

          <button type="submit" className="service-card-button request-form-submit" disabled={!form.consentToFollowUp || busy}>
            {busy ? "Saving…" : "Submit request"}
          </button>
        </form>}

        <BottomNav current="/app/search" />
      </div>
    </main>
  );
}
