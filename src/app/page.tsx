"use client"
import { useRouter } from "next/navigation";

export default function Home() {
  const router=useRouter();
  return (
    <main className="mainPage">
      <div className="header">
          <h1 className="welcome"> Quiz de culture générale !</h1>
      </div>
      <div className="under-header">
          <p> Teste ta culture en étant interrogé sur divers sujets ! </p>
      </div>
      <div style={{ display: "grid", gap: "0.5rem", marginTop: "1.5rem", width:"500px", height:"200px" }}>
      <div className="space">
          <button className="button-login">Se connecter</button>
      </div>
      <div className="space">
          <button className="button-signup">S'inscrire</button>
      </div>
      <div className="space">
        <button className="playing-guest" onClick={() => router.push("/quiz")}>Jouer en tant qu'invité</button>
      </div>
      </div>
    </main>
  );
}
