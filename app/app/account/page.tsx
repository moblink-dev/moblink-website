import Link from "next/link";
import AccountAccess from "../../../components/app/AccountAccess";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = {
  title: "Account access | MobLink",
  description: "Use a private guest session or an authorised MobLink account.",
};

export default function AccountPage() {
  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact account-shell">
        <Link href="/app/profile" className="account-back">← Profile</Link>
        <header className="account-heading">
          <p>Your MobLink</p>
          <h1>Account access</h1>
          <span>Keep cloud-saved requests private.</span>
        </header>
        <section className="account-section">
          <h2>Sign in</h2>
          <p>This staged release accepts authorised test accounts only. A private guest session is enough to test referrals, support chat and uploads on this device.</p>
          <AccountAccess />
        </section>
        <p className="account-footnote">Use fictional details during the staged cloud test. No request automatically contacts a provider.</p>
        <BottomNav current="/app/profile" />
      </div>
    </main>
  );
}
