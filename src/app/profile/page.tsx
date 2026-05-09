"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UserInfo = {
  id: number;
  email: string;
  username: string;
  age: number;
  country: string;
  bio: string;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleDeleteAvatar = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      await fetch("/api/profile/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => prev ? { ...prev, avatar_url: null } : prev);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.message || "Erreur lors du téléchargement");
        return;
      }
      setUser((prev) => prev ? { ...prev, avatar_url: data.avatar_url } : prev);
    } catch {
      setUploadError("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
            <div
              className="profile-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
              title="Changer la photo de profil"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar">{initials}</div>
              )}
              <div className="profile-avatar-overlay">
                {uploading ? "…" : "📷"}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {user.avatar_url && (
              <button
                className="profile-avatar-delete"
                onClick={handleDeleteAvatar}
                disabled={deleting}
              >
                {deleting ? "…" : "Supprimer la photo"}
              </button>
            )}
            {uploadError && (
              <p className="profile-upload-error">{uploadError}</p>
            )}
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
