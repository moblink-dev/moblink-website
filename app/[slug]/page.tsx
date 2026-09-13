import { notFound } from "next/navigation";
import { programs, publicPages, type PageKey } from "../data";
import SiteShell from "../SiteShell";

export function generateStaticParams() {
  return Object.keys(publicPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = publicPages[slug as PageKey];
  if (!page) return {};
  return {
    title: `${page.title} | IRAAC`,
    description: page.description,
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = publicPages[slug as PageKey];
  if (!page) notFound();

  return (
    <SiteShell>
      <main id="main-content">
        <section className="page-hero" style={{ backgroundImage: `url(${page.image})` }}>
          <div className="container">
            <div className="eyebrow">{page.eyebrow}</div>
            <h1>{page.hero}</h1>
            <p>{page.lead}</p>
          </div>
        </section>

        {slug === "programs" ? (
          <section>
            <div className="container">
              {programs.map((program) => (
                <article className="program-block" id={program.id} key={program.id}>
                  <div className="program-hero">
                    <img src={program.image} alt="" />
                    <div>
                      <span className="tag">{program.tag}</span>
                      <h2>{program.title}</h2>
                      <p>{program.description}</p>
                    </div>
                  </div>
                  <div className="note-box">Add real photos, outcomes and stories for {program.title} once available.</div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          page.sections.map((section, index) => (
            <section className={index % 2 === 1 ? "alt" : undefined} key={section.title}>
              <div className="container two-col">
                <div className="section-copy">
                  <h2 className="section-title">{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="card">
                  <div className="card-body">
                    <h3>{section.cardTitle ?? page.title}</h3>
                    <p>{section.cardBody ?? page.lead}</p>
                  </div>
                </div>
              </div>
            </section>
          ))
        )}
      </main>
    </SiteShell>
  );
}
