"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export function Nav() {
  const pathname = usePathname();
  const { ready, authenticated, displayName, initials, login } = useAuth();

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
          </nav>

          {!ready ? (
            // Hide during Privy init to avoid login-button flash
            <div style={{ width: 80 }} />
          ) : authenticated ? (
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
