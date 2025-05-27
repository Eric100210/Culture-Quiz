'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [bio, setBio] = useState('');
    const token = localStorage.getItem('authToken');
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
          const response = await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username, age, country, bio }),
          });
    
          const data = await response.json();
          console.log(data);
    
          if (response.ok) {
            router.push('/profile');  
          } else {
            // Afficher une erreur si la connexion échoue
            setError(data.message);
          }
        } catch (error) {
          console.error('Erreur lors de la modification du profil:', error);
          setError('Erreur lors de la modification du profil');
        } finally {
          setLoading(false);
        }
      };

    return(
        <main className="mainPage">
            <div className="header">
                <h1 className="welcome">Profil utilisateur</h1>
            </div>
            <div className="login-container">
                <div className="login-box">
                <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="username"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="age">Âge</label>
            <input
              type="age"
              id="age"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="country">Pays</label>
            <input
              type="country"
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio</label>
            <input
              type="bio"
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Chargement...' : 'Valider les changements'}
          </button>
        </form>
      </div>
                
            </div>
            <div>
        <button className="retour" onClick={() => router.push("/profile")}>
          Retour
        </button>
      </div>
        </main>
    )
}