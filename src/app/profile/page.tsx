'use client';

import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'supersecretkey'; // assure-toi que c'est bien défini

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: any = jwt.decode(token); // on ne vérifie pas la signature ici, juste décoder
        if (decoded) {
          setUser({ email: decoded.email, username: decoded.username });
        }
      } catch (err) {
        console.error('Erreur de décodage du token :', err);
        setUser(null);
      }
    }
  }, []);

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
            </>
          ) : (
            <p>Utilisateur non connecté</p>
          )}
        </div>
      </div>
    </main>
  );
}
