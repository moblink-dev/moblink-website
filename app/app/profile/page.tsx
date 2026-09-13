import Link from "next/link";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = { title: "Your profile | MobLink", description: "Your support, preferences and privacy in one place." };

export default function ProfilePage() {
  return <main className="app-page"><div className="phone-shell phone-shell-compact account-shell">
    <header className="account-heading"><p>Your MobLink</p><h1>Profile</h1><span>Your support, your way.</span></header>
    <div className="account-identity"><div className="account-avatar" aria-hidden="true">J</div><div><h2>Jayden</h2><p>Wollongong, NSW</p><span className="account-demo-badge">Demo member</span></div></div>
    <section className="account-section"><h2>Your support</h2><div className="account-group">
      <Link className="account-row" href="/app/connected/lead_demo_youthscape"><span className="account-row-icon" aria-hidden="true">I</span><span><strong>IRAAC YouthScape</strong><small>Continue your demo conversation</small></span><span aria-hidden="true">›</span></Link>
      <Link className="account-row" href="/app/messages"><span className="account-row-icon" aria-hidden="true">↗</span><span><strong>Your conversations</strong><small>MobLink and connected services</small></span><span aria-hidden="true">›</span></Link>
      <Link className="account-row" href="/app/survey?type=iraac"><span className="account-row-icon" aria-hidden="true">✓</span><span><strong>Share your feedback</strong><small>Tell us how support is going</small></span><span aria-hidden="true">›</span></Link>
    </div></section>
    <section className="account-section"><h2>Account &amp; preferences</h2><div className="account-group">
      <details className="account-disclosure"><summary><span><strong>Personal details</strong><small>About this example profile</small></span><span aria-hidden="true">＋</span></summary><dl><dt>Name</dt><dd>Jayden</dd><dt>Location</dt><dd>Wollongong 2500</dd><dt>Phone</dt><dd>04•• ••• 214 (example)</dd></dl><p>This is a fictional profile. It is not linked to a signed-in customer account.</p></details>
      <Link className="account-row" href="/app/settings"><span><strong>Display &amp; accessibility</strong><small>Text size and reduced motion</small></span><span aria-hidden="true">›</span></Link>
      <Link className="account-row" href="/app/settings#privacy"><span><strong>Privacy &amp; your information</strong><small>Understand what is saved and shared</small></span><span aria-hidden="true">›</span></Link>
    </div></section>
    <div className="account-help"><strong>A little help finding your next step?</strong><p>The MobLink assistant can help you explore services.</p><Link href="/app/messages?assistant=1">Ask MobLink <span aria-hidden="true">→</span></Link></div>
    <p className="account-footnote">You’re exploring the MobLink demo. Example conversations do not book appointments or send messages to staff.</p>
    <BottomNav current="/app/profile" />
  </div></main>;
}
