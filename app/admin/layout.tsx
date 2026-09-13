"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./workspace.css";

const links = [
  { href: "/admin/", label: "Overview", icon: "◫" },
  { href: "/admin/members", label: "People & conversations", icon: "◯" },
  { href: "/staff/support", label: "Human support inbox", icon: "↗" },
  { href: "/admin/programs", label: "Programs", icon: "▦" },
  { href: "/admin/services", label: "Service directory", icon: "⌕" },
  { href: "/admin/reports", label: "Reports & feedback", icon: "▤" },
  { href: "/admin/funding", label: "Funding workspace", icon: "✳" },
  { href: "/admin/profile", label: "Organisation profile", icon: "◇" },
  { href: "/admin/billing", label: "Plan & billing", icon: "▱" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo({ top:0, left:0, behavior:"instant" }); }, [pathname]);
  if (pathname.startsWith("/admin/funding")) return <main className="funding-app-root provider-funding">{children}</main>;
  const currentPath = pathname.replace(/\/$/, "");
  return <main className="admin-page provider-workspace"><a className="workspace-skip" href="#workspace-content">Skip to workspace</a>
    <div className="admin-shell"><aside className="admin-sidebar">
      <Link className="brand" href="/" aria-label="MobLink home">MOBLINK<span>.</span></Link>
      <div className="workspace-organisation"><span aria-hidden="true">I</span><div><strong>IRAAC</strong><small>Provider workspace</small></div></div>
      <nav aria-label="Staff dashboard sections">{links.map(link=><Link key={link.href} href={link.href} className={`admin-nav-link ${currentPath === link.href.replace(/\/$/, "") || (link.href !== "/admin/" && currentPath.startsWith(link.href)) ? "active" : ""}`} aria-current={currentPath === link.href.replace(/\/$/, "") || (link.href !== "/admin/" && currentPath.startsWith(link.href)) ? "page" : undefined}><span className="workspace-nav-icon" aria-hidden="true">{link.icon}</span><span>{link.label}</span></Link>)}</nav>
      <div className="workspace-sidebar-foot"><span>Demonstration workspace</span><p>Fictional members and conversations. No automatic calls or messages.</p><Link href="/providers/">About the provider portal ↗</Link></div>
    </aside><div className="admin-main" id="workspace-content"><div className="workspace-toolbar"><span>IRAAC <span aria-hidden="true">/</span> Community support</span><div><span className="workspace-demo">Demo</span><Link href="/app/">View community app ↗</Link></div></div>{children}</div></div>
  </main>;
}
