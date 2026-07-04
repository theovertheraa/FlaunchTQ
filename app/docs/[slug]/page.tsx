import { getDocPage, getAllSlugs, DOC_NAV } from "@/lib/docs/content";
import { addHeadingIds } from "@/lib/utils/docs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsBody } from "@/components/docs/docs-body";

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();

  const html = addHeadingIds(page.content);

  // Find group + prev/next
  const allPages = DOC_NAV.flatMap(g => g.pages);
  const idx = allPages.findIndex(p => p.slug === slug);
  const group = DOC_NAV.find(g => g.pages.some(p => p.slug === slug))?.group ?? "";
  const prev = idx > 0 ? allPages[idx - 1] : null;
  const next = idx < allPages.length - 1 ? allPages[idx + 1] : null;

  return (
    <div className="docs-article-wrap">
      <article className="docs-content">
        {/* Breadcrumb */}
        {group && (
          <div className="docs-breadcrumb">
            <span>Docs</span>
            <span className="docs-breadcrumb-sep">›</span>
            <span>{group}</span>
            <span className="docs-breadcrumb-sep">›</span>
            <span className="docs-breadcrumb-current">{page.title}</span>
          </div>
        )}

        <DocsBody html={html} />

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

      {/* TOC — right column */}
      <DocsToc content={html} />
    </div>
  );
}
