"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocsToc({ content }: { content: string }) {
  const [active, setActive] = useState<string>("");

  // Parse h2/h3 from HTML content
  const items: TocItem[] = [];
  const re = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    items.push({
      level: parseInt(m[1]),
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, ""),
    });
  }

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-64px 0px -60% 0px", threshold: 0 }
    );
    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (items.length < 2) return null;

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">On this page</div>
      <nav className="docs-toc-nav">
        {items.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`docs-toc-link${item.level === 3 ? " indent" : ""}${active === item.id ? " active" : ""}`}
            onClick={e => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              setActive(item.id);
            }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
