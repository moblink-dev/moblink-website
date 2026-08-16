"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = pathname === "/admin" ? "/admin/" : pathname;

  useEffect(() => {
    setCollapsed(localStorage.getItem("moblink_admin_sidebar") === "collapsed");
  }, []);

  if (pathname.startsWith("/admin/funding")) {
    return <main className="funding-app-root">{children}</main>;
  }

  const links = [
    { href: "/admin/", label: "Overview" },
    { href: "/admin/members", label: "AI CRM", short: "CRM" },
    { href: "/admin/services", label: "Services", short: "Services" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/profile", label: "Profile" },
    { href: "/admin/funding", label: "Funding" },
  ];

  return (
    <main className="admin-page">
      <div className={collapsed ? "admin-shell admin-shell-collapsed" : "admin-shell"}>
        <aside className={collapsed ? "admin-sidebar admin-sidebar-collapsed" : "admin-sidebar"}>
          <div className="admin-sidebar-head"><Link className="brand" href="/" aria-label="MobLink home"><span className="admin-brand-full">MOBLINK</span><span className="admin-brand-short">M</span><b>.</b></Link><button type="button" className="admin-collapse-button" aria-label={collapsed ? "Expand provider navigation" : "Collapse provider navigation"} aria-expanded={!collapsed} onClick={() => { const next = !collapsed; setCollapsed(next); localStorage.setItem("moblink_admin_sidebar", next ? "collapsed" : "expanded"); }}>{collapsed ? "›" : "‹"}</button></div>
          <p className="admin-provider-name">IRAAC</p>
          <nav aria-label="Staff dashboard sections">
            {links.map((link) => {
              const isActive =
                currentPath === link.href || (link.href !== "/admin/" && currentPath.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "admin-nav-link active" : "admin-nav-link"}
                >
                  <span>{collapsed ? (link.short || link.label.slice(0, 1)) : link.label}</span>
                  {link.href === "/admin/reports" && <span className="admin-nav-badge">1</span>}
                </Link>
              );
            })}
          </nav>
          <p className="admin-note">
            IRAAC provider demonstration using fictional community leads. Live calls, secure accounts and shared records still require production wiring.
          </p>
        </aside>
        <div className="admin-main">{children}</div>
      </div>
    </main>
  );
}
