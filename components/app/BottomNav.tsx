import Link from "next/link";

const navItems = [
  { href: "/app/messages", label: "Chat", icon: "chat" },
  { href: "/app/", label: "Browse", icon: "home" },
  { href: "/app/search", label: "Search", icon: "search" },
  { href: "/app/profile", label: "Profile", icon: "profile" },
] as const;

export type NavPage = (typeof navItems)[number]["href"];

function NavIcon({ name }: { name: (typeof navItems)[number]["icon"] }) {
  if (name === "chat") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5 3.5 21v-4.7A8 8 0 1 1 5 18.5Z"/><path d="M8 10h8M8 14h5"/></svg>;
  if (name === "home") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-6h6v6"/></svg>;
  if (name === "search") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.5-4.5 3-7 7.5-7s7 2.5 7.5 7"/></svg>;
}

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
          <span className="bottom-nav-icon"><NavIcon name={item.icon} /></span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
