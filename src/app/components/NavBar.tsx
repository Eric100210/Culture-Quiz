"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/",       label: "Accueil",      icon: "🏠" },
  { href: "/quiz",   label: "Quiz",         icon: "🎯" },
  { href: "/profile",label: "Profil",       icon: "👤" },
  { href: "/stats",  label: "Statistiques", icon: "📊" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="navbar-brand-icon">🧠</span>
            Quiz Culture
          </Link>

          <ul className="navbar-links">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={isActive(href) ? "nav-active" : ""}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            className="nav-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={`nav-drawer-overlay${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`nav-drawer${open ? " open" : ""}`}>
        <div className="nav-drawer-header">
          <Link href="/" className="navbar-brand" onClick={() => setOpen(false)}>
            <span className="navbar-brand-icon">🧠</span>
            Quiz Culture
          </Link>
          <button className="nav-drawer-close" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="nav-drawer-links">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? "nav-active" : ""}
              onClick={() => setOpen(false)}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
