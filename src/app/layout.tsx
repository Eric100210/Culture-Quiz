"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./globals.css"; // Import du CSS

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // Référence pour le bouton

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node) // Ignore le bouton
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <html lang="fr">
      <body>
        <div>{children}</div>

        {/* Bouton du menu */}
        <button ref={buttonRef} className="menu-button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✖" : "☰"}
        </button>

        {/* Menu déroulant */}
        <aside ref={menuRef} className={`menu ${isOpen ? "open" : ""}`}>
          <Link href="/" className="button-accueil"> Accueil </Link>
          <div className="ListMenu">
            <Link href="/profile" className="point">
              👤 Profil
            </Link>
            <Link href="/quiz" className="point">
              🎯 Quiz
            </Link>
            <Link href="/stats" className="point">
              📊 Statistiques
            </Link>
          </div>
        </aside>
      </body>
    </html>
  );
}

