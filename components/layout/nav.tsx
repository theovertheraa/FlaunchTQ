"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

function openSearch() {
  window.dispatchEvent(new Event("docs-search-open"));
}

export function Nav() {
  const pathname = usePathname();
  const { authenticated, displayName, initials, logout, login } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/create-agent", label: "Create" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <>
      {/* Top nav */}
      <div className="nav">
        <div className="navin">
          <Link className="brand" href="/">
            <div className="logo">F</div>
            <div>
              <div className="brandname">FlaunchTQ</div>
              <div className="brandtag">AI Agent Marketplace</div>
            </div>
          </Link>

          <nav className="floatnav">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "active" : ""}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/docs"
              className={pathname.startsWith("/docs") ? "active" : ""}
              style={{ opacity: 0.7 }}
            >
              Docs
            </Link>
          </nav>

          {/* ⌘K Search button */}
          <button className="nav-search-btn" onClick={openSearch} aria-label="Search docs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>

          {authenticated ? (
            <Link
              href="/profile"
              className="nav-cta"
              style={{ background: "#0b0b0c", border: "1px solid rgba(255,255,255,.1)", color: "#f5f5f5" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: "#6ee7b7",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#000"
                }}>
                  {initials}
                </span>
                {displayName}
              </span>
            </Link>
          ) : (
            <button className="nav-cta" onClick={login}>Login</button>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mobilebar">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
