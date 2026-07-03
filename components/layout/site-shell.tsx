"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Users },
  { href: "/create-agent", label: "Create", icon: Plus },
  { href: "/profile", label: "Profile", icon: User },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, authenticated, user, login, logout, displayName, initials } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop header */}
      <header className="sticky top-0 z-30 border-b border-white/6 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950 text-sm font-semibold text-white">
              F
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">FlaunchTQ</p>
              <p className="text-xs text-zinc-500">AI Agent Marketplace</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-white text-black"
                      : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Auth CTA */}
          <div className="hidden md:flex items-center gap-2">
            {!ready ? null : authenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                    {initials}
                  </span>
                  {displayName}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/8 bg-zinc-950 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-zinc-100"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-black/95 px-3 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs",
                  active ? "bg-white text-black" : "bg-zinc-950 text-zinc-400",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-20 md:hidden" />
    </div>
  );
}
