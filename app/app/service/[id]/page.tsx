import { notFound } from "next/navigation";
import Link from "next/link";
import { services } from "../../../data";
import ServiceDetailHero from "../../../../components/app/ServiceDetailHero";
import BottomNav from "../../../../components/app/BottomNav";

export async function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);
  if (!service) return {};
  return {
    title: `${service.name} | 1800 Mob Link`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);
  if (!service) notFound();

  const nearby = services
    .filter((s) => s.id !== service.id && !s.isNational)
    .slice(0, 3);

  return (
    <main className="app-page">
      <div className="phone-shell">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Service details</span>
          <span className="phone-signal">1800 MOB LINK</span>
        </div>

        <div className="detail-back">
          <Link href="/app/search" className="detail-back-link">
            ← Back to services
          </Link>
        </div>

        <div className="detail-hero">
          {service.isCrisis && (
            <div className="detail-crisis-banner">
              🚨 Crisis support — available 24/7. Call <strong>{service.phone}</strong> if you need help right now.
            </div>
          )}
          <ServiceDetailHero service={service} />
        </div>


        {nearby.length > 0 && (
          <section className="app-section">
            <div className="section-row">
              <h2 className="app-section-title">Other services nearby</h2>
            </div>
            <div className="service-rail">
              {nearby.map((s) => (
                <article className="mini-card" key={s.id}>
                  <div className="mini-card-top">
                    <span className="mini-card-sub">{s.subcategory}</span>
                  </div>
                  <h3 className="mini-card-name">{s.name}</h3>
                  <p className="mini-card-meta">{s.distance} · {s.suburb}</p>
                  <Link href={`/app/service/${s.id}`} className="mini-card-link">
                    View details
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <BottomNav current="/app/search" />
      </div>
    </main>
  );
}
