// src/app/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        // Sauvegarder le token dans localStorage (ou cookies)
        localStorage.setItem('authToken', data.token);

        // Rediriger l'utilisateur après une connexion réussie
        router.push('/quiz');  // Exemple : rediriger vers le tableau de bord
      } else {
        // Afficher une erreur si la connexion échoue
        setError(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Se connecter</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
