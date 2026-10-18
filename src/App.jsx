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
const DIFFICULTES = ["facile", "moyen", "difficile"];
const defiIncomplet = (defi) => !defi.categorie?.trim() || !DIFFICULTES.includes(defi.difficulte);
const dateActuelleISO = () => new Date().toISOString();

export default function App() {
  const [onglet, setOnglet] = useState("calendrier");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defis, setDefis] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [difficulte, setDifficulte] = useState("");
  const [triRecent, setTriRecent] = useState(true);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [categoriesFiltrees, setCategoriesFiltrees] = useState([]);
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const [categorieACompleter, setCategorieACompleter] = useState("");
  const [difficulteACompleter, setDifficulteACompleter] = useState("");
  const [donneesChargees, setDonneesChargees] = useState(false);
  const [erreurChargement, setErreurChargement] = useState("");
  const [erreurSauvegarde, setErreurSauvegarde] = useState("");
  const [accueilOuvert, setAccueilOuvert] = useState(() => !lireAccueil().termine);

  useEffect(() => {
    async function initialiser() {
      try {
        await initialiserSauvegarde();
        // Si l'utilisateur a déjà demandé la protection, on redemande discrètement à chaque lancement
        if (lireAccueil().persistantDemande) await demanderPersistant(false);
        else await rafraichirPersistant();
        const liste = await chargerDefis();
        setDefis(liste);
        setDonneesChargees(true);
      } catch (erreur) {
        console.error("Impossible de charger les défis.", erreur);
        setErreurChargement("Impossible de charger les défis. Tes données n'ont pas été remplacées ; recharge l'application pour réessayer.");
      }
    }
    initialiser();
  }, []);

  const categories = [...new Set(defis.map((d) => d.categorie?.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );
  const defisManquants = defis.filter(defiIncomplet);
  const defiACompleter = donneesChargees ? defisManquants[0] || null : null;

  function aller(id) {
    setOnglet(id);
    setMenuOuvert(false);
  }

  function terminerAccueil() {
    ecrireAccueil({ termine: true });
    setAccueilOuvert(false);
  }

  async function ajouterDefi() {
    const categorieNormalisee = categorie.trim().replace(/\s+/g, " ");
    if (!titre.trim() || !categorieNormalisee || !difficulte) return;
    const categorieExistante = categories.find((nom) => nom.toLocaleLowerCase("fr") === categorieNormalisee.toLocaleLowerCase("fr"));
    const nouveau = {
      id: crypto.randomUUID(),
      titre: titre.trim(),
      description: description.trim(),
      image: null,
      categorie: categorieExistante || categorieNormalisee,
      difficulte,
      dateCreation: dateActuelleISO(),
    };
    const liste = [...defis, nouveau];
    try {
      await sauvegarderDefis(liste);
      setDefis(liste);
      setTitre("");
      setDescription("");
      setCategorie("");
      setDifficulte("");
      setErreurSauvegarde("");
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
    }
  }

  async function completerDefi() {
    if (!defiACompleter) return;
    const categorieNormalisee = (categorieACompleter || defiACompleter.categorie || "").trim().replace(/\s+/g, " ");
    const difficulteChoisie = DIFFICULTES.includes(defiACompleter.difficulte) ? defiACompleter.difficulte : difficulteACompleter;
    if (!categorieNormalisee || !DIFFICULTES.includes(difficulteChoisie)) return;
    const categorieExistante = categories.find((nom) => nom.toLocaleLowerCase("fr") === categorieNormalisee.toLocaleLowerCase("fr"));
    const liste = defis.map((d) =>
      d.id === defiACompleter.id
        ? { ...d, categorie: categorieExistante || categorieNormalisee, difficulte: difficulteChoisie }
        : d
    );
    try {
      await sauvegarderDefis(liste);
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
      return;
    }
    setDefis(liste);
    setErreurSauvegarde("");
    const suivant = liste.find(defiIncomplet);
    if (suivant) {
      setCategorieACompleter(suivant.categorie || "");
      setDifficulteACompleter(suivant.difficulte || "");
    } else {
      setCategorieACompleter("");
      setDifficulteACompleter("");
    }
  }

  async function supprimerDefi(id) {
    const liste = defis.filter((d) => d.id !== id);
    try {
      await sauvegarderDefis(liste);
      setDefis(liste);
      setErreurSauvegarde("");
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
    }
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
              {erreurSauvegarde && <p className="attention" role="alert">{erreurSauvegarde}</p>}
              <input placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
              <input
                placeholder="Description (facultatif)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label className="champ-label" htmlFor="categorie-defi">Catégorie *</label>
              <input
                id="categorie-defi"
                placeholder="Choisir ou créer une catégorie"
                list="categories-defis"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                required
              />
              <datalist id="categories-defis">
                {categories.map((nom) => <option key={nom} value={nom} />)}
              </datalist>
              <label className="champ-label" htmlFor="difficulte-defi">Difficulté *</label>
              <select id="difficulte-defi" value={difficulte} onChange={(e) => setDifficulte(e.target.value)} required>
                <option value="">Choisir une difficulté</option>
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
              <button className="btn" onClick={ajouterDefi} disabled={!titre.trim() || !categorie.trim() || !difficulte}>
                Ajouter
              </button>
            </div>

            <div className="defis-entete">
              <h3 className="jour-titre">Mes défis ({defis.length})</h3>
              <div className="actions">
                <button className="btn petit" onClick={() => setTriRecent(!triRecent)}>
                  Trier : {triRecent ? "plus récents" : "plus anciens"}
                </button>
                <button className="btn petit discret" onClick={() => setFiltresOuverts(!filtresOuverts)} aria-expanded={filtresOuverts}>
                  Filtrer{categoriesFiltrees.length + difficultesFiltrees.length > 0 ? " •" : ""}
                </button>
                {(categoriesFiltrees.length > 0 || difficultesFiltrees.length > 0) && (
                  <button className="btn petit discret" onClick={() => {
                    setCategoriesFiltrees([]);
                    setDifficultesFiltrees([]);
                  }}>
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>
            {filtresOuverts && (
              <div className="tuile filtres">
                <h3>Catégories</h3>
                {categories.length ? categories.map((nom) => (
                  <label className="case-a-cocher" key={nom}>
                    <input
                      type="checkbox"
                      checked={categoriesFiltrees.includes(nom)}
                      onChange={(e) => setCategoriesFiltrees(e.target.checked
                        ? [...categoriesFiltrees, nom]
                        : categoriesFiltrees.filter((categorieFiltre) => categorieFiltre !== nom))}
                    />
                    {nom}
                  </label>
                )) : <p>Aucune catégorie disponible.</p>}
                <h3>Difficultés</h3>
                {DIFFICULTES.map((niveau) => (
                  <label className="case-a-cocher" key={niveau}>
                    <input
                      type="checkbox"
                      checked={difficultesFiltrees.includes(niveau)}
                      onChange={(e) => setDifficultesFiltrees(e.target.checked
                        ? [...difficultesFiltrees, niveau]
                        : difficultesFiltrees.filter((difficulteFiltre) => difficulteFiltre !== niveau))}
                    />
                    {niveau[0].toUpperCase() + niveau.slice(1)}
                  </label>
                ))}
                <button className="btn petit discret" onClick={() => {
                  setCategoriesFiltrees([]);
                  setDifficultesFiltrees([]);
                }}>
                  Réinitialiser les filtres
                </button>
              </div>
            )}
            {defis
              .filter((d) =>
                (categoriesFiltrees.length === 0 || categoriesFiltrees.includes(d.categorie)) &&
                (difficultesFiltrees.length === 0 || difficultesFiltrees.includes(d.difficulte))
              )
              .sort((a, b) => (triRecent ? 1 : -1) * (Date.parse(b.dateCreation) - Date.parse(a.dateCreation)))
              .map((d, i) => (
                <div key={d.id} className={`tuile c${i % 3}`}>
                  <h3>{d.titre}</h3>
                  <p>{d.description}</p>
                  <p className="meta-defi">{d.categorie} · {d.difficulte}</p>
                  <p className="meta-defi">Créé le {new Date(d.dateCreation).toLocaleString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })}</p>
                  <button className="btn danger" onClick={() => supprimerDefi(d.id)}>
                    Supprimer
                  </button>
                </div>
              ))}
            {defis.length > 0 && defis.filter((d) =>
              (categoriesFiltrees.length === 0 || categoriesFiltrees.includes(d.categorie)) &&
              (difficultesFiltrees.length === 0 || difficultesFiltrees.includes(d.difficulte))
            ).length === 0 && <p>Aucun défi ne correspond aux filtres.</p>}
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
      {defiACompleter && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-completion">
          <div className="tuile">
            <h2 id="titre-completion">Compléter tes défis</h2>
            <p>Pour continuer, ajoute les informations manquantes à ce défi :</p>
            <h3>{defiACompleter.titre}</h3>
            {!defiACompleter.categorie?.trim() && (
              <>
                <label className="champ-label" htmlFor="categorie-completion">Catégorie *</label>
                <input
                  id="categorie-completion"
                  placeholder="Choisir ou créer une catégorie"
                  list="categories-completion"
                  value={categorieACompleter}
                  onChange={(e) => setCategorieACompleter(e.target.value)}
                  autoFocus
                  required
                />
                <datalist id="categories-completion">
                  {categories.map((nom) => <option key={nom} value={nom} />)}
                </datalist>
              </>
            )}
            {!DIFFICULTES.includes(defiACompleter.difficulte) && (
              <>
                <label className="champ-label" htmlFor="difficulte-completion">Difficulté *</label>
                <select id="difficulte-completion" value={difficulteACompleter} onChange={(e) => setDifficulteACompleter(e.target.value)} required>
                  <option value="">Choisir une difficulté</option>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </>
            )}
            <button className="btn" onClick={completerDefi}
              disabled={(!defiACompleter.categorie?.trim() && !categorieACompleter.trim()) ||
                (!DIFFICULTES.includes(defiACompleter.difficulte) && !DIFFICULTES.includes(difficulteACompleter))}>
              Enregistrer et continuer
            </button>
            <p className="note">Défi {defisManquants.findIndex((d) => d.id === defiACompleter.id) + 1} sur {defisManquants.length}</p>
            {erreurSauvegarde && <p className="attention" role="alert">{erreurSauvegarde}</p>}
          </div>
        </div>
      )}
      {!donneesChargees && !erreurChargement && (
        <div className="completion-defi" role="status">
          <div className="tuile"><p>Chargement et préparation de tes données…</p></div>
        </div>
      )}
      {erreurChargement && (
        <div className="completion-defi" role="alert">
          <div className="tuile">
            <p>{erreurChargement}</p>
            <button className="btn" onClick={() => window.location.reload()}>Recharger</button>
          </div>
        </div>
      )}
    </div>
  );
}
