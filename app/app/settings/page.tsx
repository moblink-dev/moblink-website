import Link from "next/link";
import BottomNav from "../../../components/app/BottomNav";
import { DisplayPreferences } from "../../../components/app/DemoPreferences";

export const metadata = { title: "Settings | MobLink", description: "Display preferences and privacy information." };

export default function SettingsPage() {
  return <main className="app-page"><div className="phone-shell phone-shell-compact account-shell">
    <Link href="/app/profile" className="account-back">← Profile</Link>
    <header className="account-heading"><h1>Settings</h1><span>Make MobLink feel right for you.</span></header>
    <section className="account-section"><h2>Display &amp; accessibility</h2><DisplayPreferences /></section>
    <section className="account-section" id="privacy"><h2>Privacy &amp; your information</h2><div className="account-group">
      <details className="account-disclosure"><summary><span><strong>What this browser remembers</strong><small>Your preferences and demo activity</small></span><span aria-hidden="true">＋</span></summary><p>Display preferences and some demo conversations and requests are saved in this browser. They do not automatically follow you to another device. Avoid entering sensitive personal information into the demo.</p></details>
      <details className="account-disclosure"><summary><span><strong>Location and the map</strong><small>You choose what to share</small></span><span aria-hidden="true">＋</span></summary><p>Search starts around Nowra. The map does not track your live location. Distances are approximate and measured from Nowra; pins indicate directory service areas.</p></details>
      <details className="account-disclosure"><summary><span><strong>Talking to a person</strong><small>A clear handover, with permission</small></span><span aria-hidden="true">＋</span></summary><p>The Human support screen shows whether a staff inbox is connected. When available, you are asked before your assistant conversation and the location you enter are shared. Fictional adviser messages are labelled as demo messages.</p></details>
    </div></section>
    <div className="account-help"><strong>Looking for support?</strong><p>Explore services or return to your conversation.</p><Link href="/app/search">Find a service →</Link></div>
    <p className="account-footnote">MobLink demo · Settings apply to this browser only.</p>
    <BottomNav current="/app/profile" />
  </div></main>;
}
