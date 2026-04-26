"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserInfo = {
  id: number;
  email: string;
  username: string;
  age: number;
  country: string;
  bio: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) { router.push("/login"); return; }
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error();
        setUser(await res.json());
      } catch {
        // keep the token — server error, not an auth failure
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Chargement du profil…</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="page">
      <div className="page-content">
        <button className="back-btn" onClick={() => router.push("/")}>
          ← Accueil
        </button>

        <div className="profile-card animate-in">
          <div className="profile-card-header">
            <div className="profile-avatar">{initials}</div>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>

          <div className="profile-card-body">
            <div className="profile-row">
              <span className="profile-label">Âge</span>
              <span className={`profile-value${!user.age ? " empty" : ""}`}>
                {user.age || "Non renseigné"}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Pays</span>
              <span className={`profile-value${!user.country ? " empty" : ""}`}>
                {user.country || "Non renseigné"}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Bio</span>
              <span className={`profile-value${!user.bio ? " empty" : ""}`}>
                {user.bio || "Aucune bio"}
              </span>
            </div>

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/profile/edit")}
              >
                ✏️ Modifier le profil
              </button>
              <button
                className="btn btn-outline"
                onClick={() => router.push("/stats")}
              >
                📊 Voir mes statistiques
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  router.push("/login");
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
