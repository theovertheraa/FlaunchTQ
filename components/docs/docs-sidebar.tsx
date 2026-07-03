"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_NAV } from "@/lib/docs/content";
import { useState } from "react";

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(group: string) {
    setOpen(prev => ({ ...prev, [group]: !prev[group] }));
  }

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-inner">
        <div className="docs-sidebar-title">FlaunchTQ Docs</div>
        {DOC_NAV.map(({ group, pages }) => {
          const isGroupActive = pages.some(p => pathname === `/docs/${p.slug}` || pathname === `/docs` && p.slug === "introduction");
          const isOpen = open[group] !== undefined ? open[group] : isGroupActive || true;
          return (
            <div key={group} className="docs-nav-group">
              <button
                className="docs-nav-group-title"
                onClick={() => toggle(group)}
              >
                <span>{group}</span>
                <span style={{ fontSize: 10, opacity: 0.4 }}>{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen && (
                <div className="docs-nav-pages">
                  {pages.map(page => {
                    const href = `/docs/${page.slug}`;
                    const active = pathname === href || (pathname === "/docs" && page.slug === "introduction");
                    return (
                      <Link
                        key={page.slug}
                        href={href}
                        className={`docs-nav-link${active ? " active" : ""}`}
                      >
                        {page.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
