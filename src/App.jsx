import { useState, useEffect } from "react";
import { chargerDefis, sauvegarderDefis, chargerRappel, sauvegarderRappel } from "./storage";
import { telechargerRappel } from "./rappel";
import Calendrier from "./Calendrier";

const SECTIONS = [
  { id: "calendrier", label: "📅 Calendrier" },
  { id: "defis", label: "🎯 Mes défis" },
  { id: "rappel", label: "🔔 Rappel" },
];

const pad = (n) => String(n).padStart(2, "0");

export default function App() {
  const [onglet, setOnglet] = useState("calendrier");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defis, setDefis] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [rappel, setRappel] = useState(null);

  useEffect(() => {
    chargerDefis().then(setDefis);
    chargerRappel().then(setRappel);
  }, []);

  function aller(id) {
    setOnglet(id);
    setMenuOuvert(false);
  }

  async function ajouterDefi() {
    if (!titre.trim()) return;
    const nouveau = { id: crypto.randomUUID(), titre: titre.trim(), description: description.trim(), image: null };
    const liste = [...defis, nouveau];
    setDefis(liste);
    await sauvegarderDefis(liste);
    setTitre("");
    setDescription("");
  }

  async function supprimerDefi(id) {
    const liste = defis.filter((d) => d.id !== id);
    setDefis(liste);
    await sauvegarderDefis(liste);
  }

  async function changerHeure(valeur) {
    const [heure, minute] = valeur.split(":").map(Number);
    if (Number.isNaN(heure) || Number.isNaN(minute)) return;
    const nouveau = { heure, minute };
    setRappel(nouveau);
    await sauvegarderRappel(nouveau);
  }

  return (
    <div>
      <header className="entete">
        <button className="btn icone" onClick={() => setMenuOuvert(true)} aria-label="Menu">☰</button>
        <h1 className="logo"><span>Habi</span>bits</h1>
      </header>

      {menuOuvert && <div className="voile" onClick={() => setMenuOuvert(false)} />}

      <nav className={`panneau ${menuOuvert ? "ouvert" : ""}`}>
        <button className="btn icone fermer" onClick={() => setMenuOuvert(false)}>✕</button>
        <div className="panneau-titre">Menu</div>
        {SECTIONS.map((s) => (
          <button key={s.id} className={`lien ${onglet === s.id ? "actif" : ""}`} onClick={() => aller(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      <main className="contenu">
        {onglet === "calendrier" && <Calendrier defis={defis} />}

        {onglet === "defis" && (
          <div>
            <div className="tuile">
              <h2>Ajouter un défi</h2>
              <input placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
              <input placeholder="Description (facultatif)" value={description} onChange={(e) => setDescription(e.target.value)} />
              <button className="btn" onClick={ajouterDefi}>Ajouter</button>
            </div>

            <h3 className="jour-titre">Mes défis ({defis.length})</h3>
            {defis.map((d, i) => (
              <div key={d.id} className={`tuile c${i % 3}`}>
                <h3>{d.titre}</h3>
                <p>{d.description}</p>
                <button className="btn danger" onClick={() => supprimerDefi(d.id)}>Supprimer</button>
              </div>
            ))}
          </div>
        )}

        {onglet === "rappel" && (
          <div className="tuile">
            <h2>Rappel quotidien</h2>
            <p>
              Choisissez une heure, puis ajoutez le rappel à l'application Calendrier de votre
              téléphone : c'est elle qui vous enverra la notification chaque jour.
            </p>
            {rappel && (
              <label>
                Heure du rappel
                <input
                  type="time"
                  value={`${pad(rappel.heure)}:${pad(rappel.minute)}`}
                  onChange={(e) => changerHeure(e.target.value)}
                />
              </label>
            )}
            {rappel && (
              <button className="btn" onClick={() => telechargerRappel(rappel.heure, rappel.minute)}>
                Ajouter à mon calendrier
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}