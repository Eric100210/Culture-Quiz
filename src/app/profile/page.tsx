'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Non autorisé');
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        localStorage.removeItem('authToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p>Chargement du profil...</p>;

  if (!user) return <p>Utilisateur non connecté.</p>;

  return (
    <main className="mainPage">
      <div className="header">
        <h1 className="welcome">Profil utilisateur</h1>
      </div>
      <div className="login-container">
        <div className="login-box">
          {user ? (
            <>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Nom d’utilisateur :</strong> {user.username}</p>
              <p><strong>Âge :</strong> {user.age}</p>
              <p><strong>Pays :</strong> {user.country}</p>
              <p><strong>Bio :</strong> {user.bio}</p>
              <button className="edit-profile" onClick={() => router.push('/profile/edit')}>
                Modifier le profil
              </button>
            </>

          ) : (
            <p>Utilisateur non connecté</p>
            
          )}
        </div>
        <div>
        <button className="stats-button" onClick={() => router.push("/stats")}>
          Statistiques
        </button>
      </div>
      </div>
      <div>
        <button className="retour" onClick={() => router.push("/")}>
          Retour
        </button>
      </div>
      <div className="boutons-profile">
        <div>
            <button className="deconnexion" onClick={() => {
            localStorage.removeItem('authToken');
            router.push('/login');
            }}>
            Déconnexion
            </button>
        </div>
        </div>
        
    </main>
  );
}
