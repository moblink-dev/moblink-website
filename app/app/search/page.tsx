import Link from "next/link";
import { services, serviceCategories } from "../../data";
import ServiceList from "../../../components/app/ServiceList";
import MiniMap from "../../../components/app/MiniMap";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = {
  title: "Search services | Moblink",
  description: "Browse and search Aboriginal and community services by category, keyword, or location.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // Top categories - sorted by count
  const categoryCounts = serviceCategories
    .map((cat) => ({
      category: cat,
      count: services.filter((s) => s.category === cat).length,
    }))
    .sort((a, b) => b.count - a.count);

  const localCount = services.filter((s) => !s.isNational).length;
  const nationalCount = services.filter((s) => s.isNational).length;
  const aboriginalCount = services.filter((s) => s.isAboriginalLed).length;
  const freeCount = services.filter((s) => s.isFree).length;

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Moblink</span>
          <span className="phone-signal">Nowra 2541</span>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">{localCount} local services</p>
            <h1>Find nearby help</h1>
          </div>
        </header>

        <form className="mobile-service-search" action="/app/search"><span>⌕</span><input name="q" defaultValue={q} placeholder="Try housing, legal or Centrelink" aria-label="Search services" /><button>Search</button></form>

        {/* Browse nearby — mini map */}
        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Services around Nowra</h2>
          </div>
          <MiniMap />
        </section>

        {/* Browse all — quick filters */}
        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Quick filters</h2>
          </div>
          <div className="browse-grid">
            <Link href="/app/search?q=local" className="browse-card">
              <span className="browse-card-icon" aria-hidden="true">📍</span>
              <span className="browse-card-label">Local</span>
              <span className="browse-card-count">{localCount}</span>
            </Link>
            <Link href="/app/search?q=national" className="browse-card">
              <span className="browse-card-icon" aria-hidden="true">📞</span>
              <span className="browse-card-label">National</span>
              <span className="browse-card-count">{nationalCount}</span>
            </Link>
            <Link href="/app/search?q=aboriginal" className="browse-card">
              <span className="browse-card-icon" aria-hidden="true">🪶</span>
              <span className="browse-card-label">Aboriginal</span>
              <span className="browse-card-count">{aboriginalCount}</span>
            </Link>
            <Link href="/app/search?q=free" className="browse-card">
              <span className="browse-card-icon" aria-hidden="true">🎯</span>
              <span className="browse-card-label">Free</span>
              <span className="browse-card-count">{freeCount}</span>
            </Link>
          </div>
        </section>

        {/* Top categories */}
        <section className="app-section">
          <div className="section-row">
            <h2 className="app-section-title">Top categories</h2>
          </div>
          <div className="browse-categories">
            {categoryCounts.map(({ category, count }) => (
              <Link
                href={`/app/search?q=${encodeURIComponent(category.toLowerCase())}`}
                className="browse-cat-chip"
                key={category}
              >
                <span className="browse-cat-name">{category}</span>
                <span className="browse-cat-count">{count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-section">
          <ServiceList services={services} initialSearch={q || ""} title={q ? `Services matching “${q}”` : "All services"} />
        </section>

        <BottomNav current="/app/search" />
      </div>
    </main>
  );
}
