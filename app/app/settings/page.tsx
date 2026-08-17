import Link from "next/link";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = {
  title: "Settings | Moblink",
  description: "Your Moblink preferences and privacy settings.",
};

export default function SettingsPage() {
  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <div className="detail-back">
          <Link href="/app/profile" className="detail-back-link">← Back to profile</Link>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">Moblink</p>
            <h1>Settings</h1>
          </div>
        </header>


        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Preferences</h2>
          </div>
          <div className="compact-grid">
            <div className="settings-row">
              <div className="settings-row-body">
                <strong className="settings-row-label">Default location</strong>
                <span className="settings-row-desc">Nowra, NSW</span>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-body">
                <strong className="settings-row-label">Search radius</strong>
                <span className="settings-row-desc">50 km</span>
              </div>
            </div>
          </div>
        </section>

        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Privacy</h2>
          </div>
          <div className="compact-grid">
            <div className="settings-row">
              <div className="settings-row-body">
                <strong className="settings-row-label">Request history</strong>
                <span className="settings-row-desc">Stored locally on this device</span>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-body">
                <strong className="settings-row-label">Location sharing</strong>
                <span className="settings-row-desc">Ask before using</span>
              </div>
            </div>
          </div>
        </section>

        <BottomNav current="/app/profile" />
      </div>
    </main>
  );
}
