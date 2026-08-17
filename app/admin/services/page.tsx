"use client";

import { useEffect, useState } from "react";

import { iraacServices, type Service } from "../../data";
import { readProviderServiceOverrides, toProviderServiceOverrides, writeProviderServiceOverrides } from "../../../lib/provider-services";

type ProviderService = Service & { published: boolean };

export default function AdminServicesPage() {
  const [providerServices, setProviderServices] = useState<ProviderService[]>(() => iraacServices.map((service) => ({ ...service, published: true })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSnapshot, setEditSnapshot] = useState<ProviderService | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const overrides = readProviderServiceOverrides();
    setProviderServices(iraacServices.map((service) => ({ ...service, ...overrides[service.id], published: overrides[service.id]?.published ?? true })));
  }, []);

  const updateService = (id: string, values: Partial<ProviderService>) => {
    setProviderServices((current) => current.map((service) => service.id === id ? { ...service, ...values } : service));
    setSavedMessage("");
  };

  const saveServices = () => {
    writeProviderServiceOverrides(toProviderServiceOverrides(providerServices));
    setEditingId(null);
    setEditSnapshot(null);
    setSavedMessage("IRAAC service changes saved in this demonstration browser.");
  };

  const togglePublished = (id: string, published: boolean) => {
    setProviderServices((current) => {
      const next = current.map((service) => service.id === id ? { ...service, published } : service);
      writeProviderServiceOverrides(toProviderServiceOverrides(next));
      return next;
    });
    setSavedMessage(published ? "Service published to the Moblink app in this browser." : "Service moved to draft in this browser.");
  };

  const cancelEdit = () => {
    if (editSnapshot) setProviderServices((current) => current.map((service) => service.id === editSnapshot.id ? editSnapshot : service));
    setEditingId(null);
    setEditSnapshot(null);
  };

  const published = providerServices.filter((service) => service.published).length;

  return (
    <div className="admin-page-content">
      <div className="admin-top"><div><p className="admin-kicker">IRAAC provider demo</p><h1>Services</h1></div><div className="admin-stat-badge">{published} published</div></div>

      <div className="admin-banner"><div><strong>These are the services IRAAC offers through Moblink.</strong><p>IRAAC can describe each program, set its Illawarra coverage and publish it to the Moblink app so community members can learn more and request a connection.</p></div><a className="admin-button" href="/app/service/iraac-youthscape" target="_blank" rel="noreferrer">Preview in app</a></div>

      <div className="provider-service-summary"><div><strong>{providerServices.length}</strong><span>IRAAC programs</span></div><div><strong>{published}</strong><span>Visible in app</span></div><div><strong>Illawarra</strong><span>Primary lead area</span></div></div>
      <p className="prototype-note">Publishing and editing are browser-only demonstration controls. Production publishing will require verified IRAAC accounts, secure storage and an approval history.</p>
      {savedMessage ? <div className="lead-created" role="status">{savedMessage}</div> : null}

      <div className="provider-service-list">
        {providerServices.map((service) => {
          const editing = editingId === service.id;
          return <article className="provider-service-card" key={service.id}>
            <div className="provider-service-card-top"><div><span>{service.category}</span><h2>{service.name.replace("IRAAC ", "")}</h2></div><label className="publish-toggle"><input type="checkbox" checked={service.published} onChange={(event) => togglePublished(service.id, event.target.checked)} /><span>{service.published ? "Published" : "Draft"}</span></label></div>
            {editing ? <div className="provider-service-editor"><label>Service name<input value={service.name} onChange={(event) => updateService(service.id, { name: event.target.value })} /></label><label>What the service offers<textarea rows={4} value={service.description} onChange={(event) => updateService(service.id, { description: event.target.value })} /></label><label>Coverage area<input value={service.address} onChange={(event) => updateService(service.id, { address: event.target.value })} /></label><div><button className="admin-button" type="button" onClick={saveServices}>Save changes</button><button className="admin-small-btn" type="button" onClick={cancelEdit}>Cancel</button></div></div> : <><p>{service.description}</p><dl><div><dt>Coverage</dt><dd>{service.address}</dd></div><div><dt>Who it supports</dt><dd>{service.eligibility}</dd></div><div><dt>App category</dt><dd>{service.category}</dd></div></dl><div className="provider-service-actions"><button type="button" className="admin-small-btn admin-small-btn-primary" onClick={() => { setEditingId(service.id); setEditSnapshot({ ...service }); }}>Edit service</button><a href={`/app/service/${service.id}`} className="admin-small-btn" target="_blank" rel="noreferrer">View in app</a></div></>}
          </article>;
        })}
      </div>
    </div>
  );
}
