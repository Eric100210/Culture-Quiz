export default function Home() {
  return (
    <main className="mainPage">
      <div className="header">
          <h1 className="welcome"> Quiz de culture générale !</h1>
      </div>
      <div className="under-header">
          <p> Teste ta culture en étant interrogé sur divers sujets ! </p>
      </div>
      <div className="space">
          <button className="button-login">Se connecter</button>
      </div>
      <div className="space">
          <button className="button-signup">S'inscrire</button>
      </div>
    </main>
  );
}
