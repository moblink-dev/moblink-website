import Link from "next/link";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = {
  title: "Jayden's profile | Moblink",
  description: "Jayden's Moblink profile, services and preferences.",
};

export default function ProfilePage() {
  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Moblink</span>
          <span className="phone-signal">Wollongong 2500</span>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">Your Moblink account</p>
            <h1>Profile</h1>
          </div>
          <Link href="/app/settings" className="profile-settings-btn" aria-label="Settings">
            ⚙️
          </Link>
        </header>


        <section className="app-section">
          <div className="profile-card">
            <div className="profile-avatar profile-avatar-jayden"><span>J</span></div>
            <h2 className="profile-name">Jayden</h2>
            <p className="profile-desc">04•• ••• 214 · Wollongong 2500</p>
            <div className="profile-status-row"><span>Active member</span><span>SMS &amp; app</span></div>
            <div className="profile-actions">
              <Link href="/app/settings" className="service-card-button">Edit my details</Link>
            </div>
            <p className="profile-note">Your contact permission is recorded. You control how organisations contact you.</p>
          </div>
        </section>

        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Quick links</h2>
          </div>
          <div className="compact-grid">
            <Link href="/app/connected/lead_demo_youthscape" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">🤝</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">IRAAC YouthScape</strong>
                <span className="compact-card-meta">Youth legal support · awaiting review</span>
              </div>
            </Link>
            <Link href="/app/messages" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">💬</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">Messages</strong>
                <span className="compact-card-meta">Updates from Moblink and connected services</span>
              </div>
            </Link>
            <Link href="/app/settings" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">⚙️</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">Settings</strong>
                <span className="compact-card-meta">Preferences and privacy</span>
              </div>
            </Link>
            <Link href="/app/survey?type=iraac" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">📝</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">IRAAC check-in due</strong>
                <span className="compact-card-meta">Tell IRAAC how support is going</span>
              </div>
            </Link>
            <div className="compact-card profile-next-checkin"><span className="compact-card-emoji">📅</span><div className="compact-card-body"><strong className="compact-card-name">Next check-in</strong><span className="compact-card-meta">15 September · Moblink AI call</span></div></div>
          </div>
        </section>

        <BottomNav current="/app/profile" />
      </div>
    </main>
  );
}
