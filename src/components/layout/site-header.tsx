"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/ipos", label: "Explore IPOs" },
  { href: "/learn", label: "Learn" },
  { href: "/glossary", label: "Glossary" },
  { href: "/methodology", label: "Methodology" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="IPO Simplified home">
          <span className="grid size-8 place-items-center rounded-lg bg-brand font-serif text-lg text-on-brand" aria-hidden>
            i
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">IPO Simplified</span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(n.href) ? "bg-sunken text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
        <button
          type="button"
          className="ml-auto rounded-md p-2 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-paper lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={cn("block rounded-md px-3 py-3 font-medium", isActive(n.href) ? "bg-sunken" : "text-ink-2")}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-line px-7 py-3">
            <span className="text-sm text-ink-2">Theme</span>
            <ThemeToggle showLabels />
          </div>
        </nav>
      )}
    </header>
  );
}
