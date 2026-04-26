"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ age, country, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/profile");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Erreur lors de la modification du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✏️</div>
        <h1>Modifier le profil</h1>
        <p className="auth-subtitle">Mets tes informations à jour</p>

        {error && <div className="form-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="age">
              Âge
            </label>
            <input
              className="form-input"
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="1"
              max="120"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="country">
              Pays
            </label>
            <input
              className="form-input"
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="France"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bio">
              Bio
            </label>
            <input
              className="form-input"
              type="text"
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Passionné de culture générale…"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </form>

        <div style={{ marginTop: "12px" }}>
          <button
            className="btn btn-outline btn-full"
            onClick={() => router.push("/profile")}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
