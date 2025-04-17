'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';  // On garde ton CSS global

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Sauvegarder le token dans localStorage
        localStorage.setItem('authToken', data.token);

        // ✅ Rediriger vers la page de profil
        router.push('/profile');
      } else {
        setError(data.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mainPage">
      <div className="header">
        <h1 className="welcome">Connexion à votre compte</h1>
      </div>

      <div className="login-container">
        <div className="login-box">
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Chargement...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>

      <div>
        <button className="retour" onClick={() => router.push("/")}>
          Retour
        </button>
      </div>
    </main>
  );
}
