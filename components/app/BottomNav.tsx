import Link from "next/link";

const navItems = [
  { href: "/app/messages", label: "Chat", icon: "💬" },
  { href: "/app/", label: "Browse", icon: "🏘️" },
  { href: "/app/search", label: "Search", icon: "🔍" },
  { href: "/app/profile", label: "Profile", icon: "👤" },
] as const;

export type NavPage = (typeof navItems)[number]["href"];

export default function BottomNav({ current }: { current?: string }) {
  return (
    <nav className="bottom-nav" aria-label="Moblink sections">
      {navItems.map((item) => (
        <Link
          href={item.href}
          className={`bottom-nav-item ${current === item.href ? "bottom-nav-active" : ""}`}
          key={item.href}
          aria-current={current === item.href ? "page" : undefined}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
