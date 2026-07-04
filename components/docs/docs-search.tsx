"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllSlugs, getDocPage, DOC_NAV } from "@/lib/docs/content";

interface SearchResult {
  slug: string;
  title: string;
  group: string;
  excerpt: string;
}

function buildIndex(): SearchResult[] {
  return getAllSlugs().map(slug => {
    const page = getDocPage(slug)!;
    const text = page.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const group = DOC_NAV
      .flatMap(g => g.pages.map(p => ({ slug: p.slug, group: g.group })))
      .find(p => p.slug === slug)?.group ?? "";
    return { slug, title: page.title, group, excerpt: text.slice(0, 120) };
  });
}

const INDEX = buildIndex();

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? INDEX.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : INDEX.slice(0, 8);

  const openModal = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelected(0);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") closeModal();
    }
    function onCustom() { openModal(); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("docs-search-open", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("docs-search-open", onCustom);
    };
  }, [openModal, closeModal]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  function navigate(slug: string) {
    router.push(`/docs/${slug}`);
    closeModal();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) navigate(results[selected].slug);
  }

  if (!open) return null;

  return (
    <div className="docs-search-overlay" onClick={closeModal}>
      <div className="docs-search-modal" onClick={e => e.stopPropagation()}>
        <div className="docs-search-input-wrap">
          <span className="docs-search-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            className="docs-search-input"
            placeholder="Search documentation..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
          />
          <kbd className="docs-search-esc" onClick={closeModal}>Esc</kbd>
        </div>

        <div className="docs-search-results">
          {results.length === 0 ? (
            <div className="docs-search-empty">No results for &quot;{query}&quot;</div>
          ) : results.map((r, i) => (
            <button
              key={r.slug}
              className={`docs-search-result${i === selected ? " selected" : ""}`}
              onClick={() => navigate(r.slug)}
              onMouseEnter={() => setSelected(i)}
            >
              <span className="docs-search-result-group">{r.group}</span>
              <span className="docs-search-result-title">{r.title}</span>
              <span className="docs-search-result-excerpt">{r.excerpt}</span>
            </button>
          ))}
        </div>

        <div className="docs-search-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
