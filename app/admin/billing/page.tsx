"use client";

import { useState } from "react";

const plans = [
  { id: "free", name: "Free", price: "$0", allowance: "5 lead responses / month", detail: "Create your profile, publish services and use the provider workspace." },
  { id: "premium", name: "Premium", price: "$20", allowance: "20 lead responses / month", detail: "For growing organisations responding to a steady community inbox." },
  { id: "pro", name: "Pro", price: "$100", allowance: "Unlimited lead responses", detail: "For larger teams that need unrestricted lead response capacity." },
] as const;

export default function BillingPage() {
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("free");
  const [promotion, setPromotion] = useState<"off" | "monthly" | "clicks">("off");
  const [credit, setCredit] = useState(0);
  const [notice, setNotice] = useState("");
  const used = 3;
  const current = plans.find((item) => item.id === plan) || plans[0];

  return <div className="admin-page-content billing-page">
    <header className="billing-head"><div><p className="admin-kicker">Organisation settings</p><h1>Billing</h1><p>Choose how many community leads IRAAC can respond to each month.</p></div><span>Current plan · {current.name}</span></header>
    <section className="billing-usage"><div><strong>{used} of {plan === "free" ? 5 : plan === "premium" ? 20 : "unlimited"}</strong><span>lead responses used this month</span></div><div className="billing-meter"><i style={{ width: plan === "free" ? "60%" : plan === "premium" ? "15%" : "6%" }} /></div><small>Resets 1 September · Viewing leads and using your profile remain available.</small></section>
    <div className="billing-plan-grid">{plans.map((item) => <article key={item.id} className={item.id === plan ? "active" : ""}><span>{item.id === plan ? "Current plan" : item.name}</span><h2>{item.name}</h2><p className="billing-price">{item.price}<small>/month</small></p><strong>{item.allowance}</strong><p>{item.detail}</p><button type="button" disabled={item.id === plan} onClick={() => { setPlan(item.id); setNotice(`${item.name} selected for this demonstration. No payment was taken.`); }}>{item.id === plan ? "Selected" : `Choose ${item.name}`}</button></article>)}</div>
    <section className="billing-promotion">
      <header><div><p className="admin-kicker">Optional local promotion</p><h2>Reach more people in the Illawarra</h2><p>Sponsored placement is separate from the provider plan. It can place IRAAC above ordinary results when a person searches within IRAAC’s service region.</p></div><span>{promotion === "off" ? "Not active" : promotion === "monthly" ? "$20 monthly boost" : `$${credit} click credit`}</span></header>
      <div className="billing-promotion-grid">
        <article className={promotion === "monthly" ? "active" : ""}><span>Simple monthly option</span><h3>Regional search boost</h3><strong>$20<small>/month</small></strong><p>Eligible IRAAC services can appear in a clearly labelled sponsored position for local searches.</p><button type="button" onClick={() => { setPromotion("monthly"); setNotice("Monthly regional boost selected for this demonstration. No payment was taken."); }}>Choose $20 boost</button></article>
        <article className={promotion === "clicks" ? "active" : ""}><span>Pay for engagement</span><h3>Sponsored click credit</h3><strong>${credit}<small> balance</small></strong><p>Add credit and only deduct it when a person opens IRAAC’s sponsored service result.</p><div>{[5, 20, 50].map((amount) => <button type="button" key={amount} onClick={() => { setPromotion("clicks"); setCredit((current) => current + amount); setNotice(`$${amount} demonstration credit added. No payment was taken.`); }}>+ ${amount}</button>)}</div></article>
        <aside><b>How sponsored results work</b><ol><li>Only show inside IRAAC’s verified region and service categories.</li><li>Always label the result “Sponsored”.</li><li>Ranking must still respect safety, suitability and distance.</li></ol><button type="button" disabled={promotion === "off"} onClick={() => { setPromotion("off"); setCredit(0); setNotice("Demonstration promotion stopped."); }}>Stop promotion</button></aside>
      </div>
    </section>
    <p className="billing-note" role="status">{notice || "Demonstration pricing only. Upgrade buttons do not create a subscription or take payment."}</p>
  </div>;
}
