import Link from "next/link";
import { services } from "../../data";
import ServiceList from "../../../components/app/ServiceList";
import BottomNav from "../../../components/app/BottomNav";

export const metadata = { title: "Search services | MobLink", description: "Find Aboriginal and community services by need, postcode or location." };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <main className="app-page"><div className="phone-shell phone-shell-compact">
    <header className="app-top app-top-compact"><div><p className="app-kicker">Find your next step</p><h1>Explore support</h1></div><Link className="section-link" href="/app/map">Map ↗</Link></header>
    <ServiceList key={q ?? "all"} services={services} initialSearch={q ?? ""} />
    <p className="illustration-note">Images illustrate the support offered. They are AI-generated, not actual staff or premises.</p>
    <BottomNav current="/app/search" />
  </div></main>;
}
