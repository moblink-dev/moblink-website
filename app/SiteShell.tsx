import Link from "next/link";
import "./public-site.css";

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Moblink home">MOB<span>LINK</span><b>.</b></Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/about/">About us</Link><Link href="/services/">Services</Link><Link href="/#how-it-works">How it works</Link>
        </nav>
        <div className="header-actions">
          <Link href="/providers/" className="nav-provider">For organisations</Link>
          <Link href="/app/" className="nav-login" aria-label="Open the Moblink app">Open app</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <>
      <div className="acknowledgement"><div className="container">Moblink acknowledges the Traditional Custodians of Country across Australia and pays respect to Elders past and present.</div></div>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-intro">
              <h4>Moblink</h4>
              <p>Helping Aboriginal and Torres Strait Islander people find and connect with suitable services.</p>
              <Link href="/admin/" className="footer-admin-button">Service Provider Portal</Link>
            </div>
            <div><h4>Find support</h4><ul><li><Link href="/app/">Open the app</Link></li><li><Link href="/services/">Explore support</Link></li><li><Link href="/app/search/">Service map</Link></li><li><Link href="/app/messages/?assistant=1">Talk to Moblink</Link></li></ul></div>
            <div><h4>About Moblink</h4><ul><li><Link href="/about/">About us</Link></li><li><Link href="/services/">Services</Link></li><li><Link href="/#community-stories">Example journeys</Link></li><li><Link href="/providers/">For organisations</Link></li></ul></div>
          </div>
          <div className="footer-bottom"><span>&copy; 2026 Moblink. Working prototype.</span><span>Call 000 in an emergency. Moblink does not replace emergency services.</span></div>
        </div>
      </footer>
    </>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="public-site"><a className="public-skip-link" href="#main-content">Skip to content</a><Header />{children}<Footer /></div>;
}
