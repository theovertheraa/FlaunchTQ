import { getDocPage, getAllSlugs, DOC_NAV } from "@/lib/docs/content";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const page = getDocPage(params.slug);
  if (!page) notFound();

  // Find prev/next
  const allPages = DOC_NAV.flatMap(g => g.pages);
  const idx = allPages.findIndex(p => p.slug === params.slug);
  const prev = idx > 0 ? allPages[idx - 1] : null;
  const next = idx < allPages.length - 1 ? allPages[idx + 1] : null;

  return (
    <article className="docs-content">
      <div
        className="docs-body"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Prev / Next */}
      <div className="docs-nav-footer">
        {prev ? (
          <Link href={`/docs/${prev.slug}`} className="docs-nav-btn prev">
            <span className="docs-nav-btn-label">← Previous</span>
            <span className="docs-nav-btn-title">{prev.title}</span>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/docs/${next.slug}`} className="docs-nav-btn next">
            <span className="docs-nav-btn-label">Next →</span>
            <span className="docs-nav-btn-title">{next.title}</span>
          </Link>
        ) : <div />}
      </div>
    </article>
  );
}
