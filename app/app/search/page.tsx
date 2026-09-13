import MapPage from "../map/page";
export const metadata = { title: "Search the map | MobLink" };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{q?:string}> }) {
  const {q} = await searchParams;
  return <MapPage key={q ?? "all"} initialSearch={q ?? ""} />;
}
