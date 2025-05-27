// src/app/signup/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';  

export default function SignupPage() {
  const [username, setUsername] = useState('');
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
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder le token dans localStorage (ou cookies)
        localStorage.setItem('authToken', data.token);

        // Rediriger l'utilisateur après une connexion réussie
        router.push('/quiz');  
      } else {
        // Afficher une erreur si la connexion échoue
        setError(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création de compte:', error);
      setError('Erreur lors de la création de la compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mainPage">
    <div className="header">
          <h1 className="welcome"> Créez votre compte</h1>
      </div>
    <div className="login-container">
      <div className="login-box">
        

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="username"
              id="usernmae"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
            {loading ? 'Chargement...' : 'Créer votre compte'}
          </button>
        </form>
      </div>
    </div>
    <div>
      <button className="retour" onClick={() => router.push("/")}> Retour </button>
      </div>
    </main>
  );
}
