import Link from "next/link";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = {
  title: "Profile | 1800 Mob Link",
  description: "Your 1800 Mob Link profile and preferences.",
};

export default function ProfilePage() {
  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Profile</span>
          <span className="phone-signal">1800 MOB LINK</span>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">1800 Mob Link</p>
            <h1>Profile</h1>
          </div>
          <Link href="/app/settings" className="profile-settings-btn" aria-label="Settings">
            ⚙️
          </Link>
        </header>


        <section className="app-section">
          <div className="profile-card">
            <div className="profile-avatar">
              <span className="profile-avatar-icon">👤</span>
            </div>
            <h2 className="profile-name">Not signed in</h2>
            <p className="profile-desc">Sign in to save your connected services and preferences.</p>
            <div className="profile-actions">
              <button type="button" className="service-card-button" disabled>
                Sign in with phone
              </button>
            </div>
            <p className="profile-note">Phone sign-in will be available in the next update.</p>
          </div>
        </section>

        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Quick links</h2>
          </div>
          <div className="compact-grid">
            <Link href="/app/connected" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">🔗</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">Connected services</strong>
                <span className="compact-card-meta">View your service requests</span>
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
            <Link href="/app/survey" className="compact-card">
              <span className="compact-card-emoji" aria-hidden="true">📝</span>
              <div className="compact-card-body">
                <strong className="compact-card-name">Have Your Say</strong>
                <span className="compact-card-meta">Complete the community survey</span>
              </div>
            </Link>
          </div>
        </section>

        <BottomNav current="/app/profile" />
      </div>
    </main>
  );
}
