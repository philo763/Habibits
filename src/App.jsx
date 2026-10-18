import { useState, useEffect } from "react";
import { chargerDefis, sauvegarderDefis } from "./storage";
import {
  initialiserSauvegarde,
  demanderPersistant,
  rafraichirPersistant,
  lireAccueil,
  ecrireAccueil,
} from "./sauvegarde";
import Calendrier from "./Calendrier";
import Parametres from "./Parametres";
import Accueil from "./Accueil";
import { Bandeaux, Indicateur } from "./Bandeaux";
import "./sauvegarde.css";

const SECTIONS = [
  { id: "calendrier", label: "📅 Calendrier" },
  { id: "defis", label: "🎯 Mes défis" },
  { id: "parametres", label: "⚙️ Paramètres" },
];

export default function App() {
  const [onglet, setOnglet] = useState("calendrier");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defis, setDefis] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [accueilOuvert, setAccueilOuvert] = useState(() => !lireAccueil().termine);

  useEffect(() => {
    chargerDefis().then(setDefis);
    initialiserSauvegarde();
    // Si l'utilisateur a déjà demandé la protection, on redemande discrètement à chaque lancement
    if (lireAccueil().persistantDemande) demanderPersistant(false);
    else rafraichirPersistant();
  }, []);

  function aller(id) {
    setOnglet(id);
    setMenuOuvert(false);
  }

  function terminerAccueil() {
    ecrireAccueil({ termine: true });
    setAccueilOuvert(false);
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

  return (
    <div>
      <header className="entete">
        <button className="btn icone" onClick={() => setMenuOuvert(true)} aria-label="Menu">
          ☰
        </button>
        <h1 className="logo">
          <span>Habi</span>bits
        </h1>
        <Indicateur onClick={() => aller("parametres")} />
      </header>

      {menuOuvert && <div className="voile" onClick={() => setMenuOuvert(false)} />}

      <nav className={`panneau ${menuOuvert ? "ouvert" : ""}`}>
        <button className="btn icone fermer" onClick={() => setMenuOuvert(false)}>
          ✕
        </button>
        <div className="panneau-titre">Menu</div>
        {SECTIONS.map((s) => (
          <button key={s.id} className={`lien ${onglet === s.id ? "actif" : ""}`} onClick={() => aller(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      <main className="contenu">
        <Bandeaux />

        {onglet === "calendrier" && <Calendrier defis={defis} />}

        {onglet === "defis" && (
          <div>
            <div className="tuile">
              <h2>Ajouter un défi</h2>
              <input placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
              <input
                placeholder="Description (facultatif)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button className="btn" onClick={ajouterDefi}>
                Ajouter
              </button>
            </div>

            <h3 className="jour-titre">Mes défis ({defis.length})</h3>
            {defis.map((d, i) => (
              <div key={d.id} className={`tuile c${i % 3}`}>
                <h3>{d.titre}</h3>
                <p>{d.description}</p>
                <button className="btn danger" onClick={() => supprimerDefi(d.id)}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {onglet === "parametres" && (
          <Parametres
            onRevoirAccueil={() => {
              setMenuOuvert(false);
              setAccueilOuvert(true);
            }}
          />
        )}
      </main>

      {accueilOuvert && <Accueil onTermine={terminerAccueil} />}
    </div>
  );
}
