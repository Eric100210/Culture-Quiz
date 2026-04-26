"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  const modes = [
    {
      id: "classic",
      icon: "🎯",
      title: "Quiz Classique",
      desc: "À ton propre rythme",
    },
    {
      id: "rapid",
      icon: "⚡",
      title: "Quiz Rapide",
      desc: "60 secondes chrono",
    },
    {
      id: "endurance",
      icon: "🔥",
      title: "Quiz Endurance",
      desc: "Une erreur et c'est fini",
    },
  ];

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-eyebrow">🧠 Culture Générale</div>
        <h1>
          Teste tes connaissances,
          <br />
          dépasse tes limites
        </h1>
        <p className="hero-subtitle">
          Des centaines de questions sur l&apos;histoire, les sciences, la
          géographie et bien plus encore.
        </p>

        <div className="hero-actions">
          {isLoggedIn ? (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push("/quiz")}
              >
                Jouer maintenant
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => router.push("/profile")}
              >
                Mon profil
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push("/login")}
              >
                Se connecter
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => router.push("/signup")}
              >
                Créer un compte
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => router.push("/quiz")}
              >
                Jouer en invité
              </button>
            </>
          )}
        </div>

        <p className="hero-divider">Trois modes de jeu</p>

        <div className="hero-features">
          {modes.map(({ id, icon, title, desc }) => (
            <div
              key={id}
              className="hero-feature-card"
              onClick={() => router.push("/quiz")}
            >
              <div className="hero-feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
