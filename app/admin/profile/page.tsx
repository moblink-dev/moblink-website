"use client";

import { useEffect, useState, type FormEvent } from "react";

type ProviderProfile = {
  organisation: string;
  address: string;
  suburb: string;
  postcode: string;
  region: string;
  email: string;
  phone: string;
  website: string;
  officeHours: string;
  description: string;
  history: string;
  contacts: ProviderContact[];
};

type ProviderContact = { id: string; name: string; role: string; email: string; phone: string; image: string };

const storageKey = "moblink_iraac_provider_profile";
const initialProfile: ProviderProfile = {
  organisation: "IRAAC",
  address: "",
  suburb: "Wollongong",
  postcode: "2500",
  region: "Illawarra and South Coast",
  email: "",
  phone: "",
  website: "https://www.iraac-aco.com/",
  officeHours: "Add opening hours",
  description: "Community-led support through MCC, YouthScape, The Crew and DARC.",
  history: "Add IRAAC’s story, important milestones and connection to community.",
  contacts: [
    { id: "primary", name: "Primary contact", role: "Organisation contact", email: "", phone: "", image: "" },
    { id: "programs", name: "Program contact", role: "Programs and referrals", email: "", phone: "", image: "" },
  ],
};

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ProviderProfile>;
        setProfile({ ...initialProfile, ...parsed, contacts: Array.isArray(parsed.contacts) ? parsed.contacts : initialProfile.contacts });
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  const update = (field: keyof ProviderProfile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateContact = (id: string, field: keyof Omit<ProviderContact, "id">, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, contacts: current.contacts.map((contact) => contact.id === id ? { ...contact, [field]: value } : contact) }));
  };

  const addContact = () => {
    const id = `contact_${Date.now()}`;
    setProfile((current) => ({ ...current, contacts: [...current.contacts, { id, name: "New contact", role: "", email: "", phone: "", image: "" }] }));
    setSaved(false);
  };

  const loadImage = (id: string, file?: File) => {
    if (!file || file.size > 1_500_000) return;
    const reader = new FileReader();
    reader.onload = () => updateContact(id, "image", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(profile));
    setSaved(true);
  };

  return <div className="admin-page-content provider-profile-page">
    <div className="profile-page-head">
      <div><p className="admin-kicker">Organisation settings</p><h1>IRAAC profile</h1><p>Keep public contact and service-area details accurate across MobLink.</p></div>
      <span>Provider profile</span>
    </div>

    <div className="provider-profile-layout">
      <form className="provider-profile-form" onSubmit={save}>
        <div className="provider-profile-section"><h2>Organisation</h2><p>Details shown to community members when they connect with IRAAC.</p></div>
        <div className="provider-profile-grid">
          <label>Organisation name<input value={profile.organisation} onChange={(event) => update("organisation", event.target.value)} required /></label>
          <label>Service region<input value={profile.region} onChange={(event) => update("region", event.target.value)} /></label>
          <label className="provider-profile-wide">Street address<input value={profile.address} onChange={(event) => update("address", event.target.value)} placeholder="Add the public office address" /></label>
          <label>Suburb<input value={profile.suburb} onChange={(event) => update("suburb", event.target.value)} /></label>
          <label>Postcode<input inputMode="numeric" value={profile.postcode} onChange={(event) => update("postcode", event.target.value)} /></label>
          <label>Public email<input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} placeholder="Add a monitored inbox" /></label>
          <label>Public phone<input type="tel" value={profile.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Add a public number" /></label>
          <label className="provider-profile-wide">Website<input type="url" value={profile.website} onChange={(event) => update("website", event.target.value)} /></label>
          <label className="provider-profile-wide">Office hours<input value={profile.officeHours} onChange={(event) => update("officeHours", event.target.value)} /></label>
          <label className="provider-profile-wide">About IRAAC<textarea rows={4} value={profile.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label className="provider-profile-wide">History<textarea rows={4} value={profile.history} onChange={(event) => update("history", event.target.value)} /></label>
        </div>
        <section className="provider-contacts-editor">
          <div className="provider-profile-section"><h2>Key contacts</h2><p>Add the people community members and partner organisations should contact.</p></div>
          <div className="provider-contact-list">{profile.contacts.map((contact) => <article className="provider-contact-editor" key={contact.id}>
            <label className="provider-contact-photo"><span>{contact.image ? <img src={contact.image} alt="" /> : contactInitials(contact.name)}</span><input type="file" accept="image/*" onChange={(event) => loadImage(contact.id, event.target.files?.[0])} />Add image</label>
            <div><label>Name<input value={contact.name} onChange={(event) => updateContact(contact.id, "name", event.target.value)} /></label><label>Role<input value={contact.role} onChange={(event) => updateContact(contact.id, "role", event.target.value)} /></label><label>Email<input type="email" value={contact.email} onChange={(event) => updateContact(contact.id, "email", event.target.value)} placeholder="Monitored email" /></label><label>Phone<input type="tel" value={contact.phone} onChange={(event) => updateContact(contact.id, "phone", event.target.value)} placeholder="Public number" /></label></div>
          </article>)}</div>
          <button type="button" className="admin-small-btn" onClick={addContact}>+ Add key contact</button>
          <small>Images stay in this demonstration browser. Use a square image under 1.5 MB.</small>
        </section>
        <div className="provider-profile-actions"><button className="admin-button" type="submit">Save profile</button>{saved ? <span role="status">Saved in this demonstration browser.</span> : null}</div>
      </form>

      <aside className="provider-profile-preview">
        <p className="admin-kicker">Directory preview</p><h2>{profile.organisation || "Organisation name"}</h2><span>{[profile.suburb, profile.postcode].filter(Boolean).join(" ")} · {profile.region}</span>
        <p>{profile.description}</p>
        <div className="provider-history-preview"><span>Our history</span><p>{profile.history}</p></div>
        <dl><div><dt>Address</dt><dd>{profile.address || "Not published yet"}</dd></div><div><dt>Contact</dt><dd>{profile.phone || profile.email || "Not published yet"}</dd></div><div><dt>Hours</dt><dd>{profile.officeHours}</dd></div></dl>
        <div className="provider-contact-preview"><span>Key contacts</span>{profile.contacts.map((contact) => <div key={contact.id}><span>{contact.image ? <img src={contact.image} alt="" /> : contactInitials(contact.name)}</span><p><strong>{contact.name}</strong><small>{contact.role || "Add role"}</small></p></div>)}</div>
        <small>Demonstration only. Saving here does not publish data to a live directory.</small>
      </aside>
    </div>
  </div>;
}

function contactInitials(value: string) {
  return value.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";
}
