import { useState, useEffect } from "react";
import {
  chargerDonneesDefis,
  sauvegarderDefis,
  sauvegarderObjectifs,
  chargerJours,
  sauvegarderJours,
  chargerGestionDefis,
  sauvegarderGestionDefis,
} from "./storage";
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
import Regles from "./Regles";
import Collection from "./Collection";
import Notes from "./Notes";
import { Bandeaux, Indicateur } from "./Bandeaux";
import { COULEURS_OBJECTIF, couleurObjectif } from "./objectifs";
import IndicateurDifficulte from "./IndicateurDifficulte";
import { cleDate } from "./dates";
import { calculerRecompenses } from "./recompenses";
import "./sauvegarde.css";

const SECTIONS = [
  { id: "calendrier", label: "📅 Calendrier" },
  { id: "defis", label: "🎯 Mes défis" },
  { id: "collection", label: "🃏 Collection" },
  { id: "notes", label: "📝 Notes à moi-même" },
  { id: "regles", label: "📖 Règles du jeu" },
  { id: "parametres", label: "⚙️ Paramètres" },
];
const A_PROPOS = { id: "apropos", label: "ℹ️ À propos" };
const DIFFICULTES = ["facile", "moyen", "difficile"];
const defiIncomplet = (defi, objectifs) =>
  !objectifs.some((objectif) => objectif.id === defi.objectifId) || !DIFFICULTES.includes(defi.difficulte);
const dateActuelleISO = () => new Date().toISOString();

function cleDeDemain() {
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  return cleDate(demain);
}

function datesAvecTirageInterdit(jours, dateLimite) {
  return Object.entries(jours)
    .filter(([date, jour]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      date > dateLimite &&
      ((Array.isArray(jour?.propositions) && jour.propositions.length > 0) || Boolean(jour?.choisi))
    )
    .map(([date]) => date)
    .sort();
}

export default function App() {
  const [onglet, setOnglet] = useState("calendrier");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defis, setDefis] = useState([]);
  const [objectifs, setObjectifs] = useState([]);
  const [jours, setJours] = useState({});
  const [gestionDefis, setGestionDefis] = useState({
    defiDuMomentId: "",
    defiDuMomentActif: false,
    frequencesHebdo: {},
  });
  const [datesTiragesAConfirmer, setDatesTiragesAConfirmer] = useState([]);
  const [erreurNettoyage, setErreurNettoyage] = useState("");
  const [nettoyageEnCours, setNettoyageEnCours] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [objectifId, setObjectifId] = useState("");
  const [difficulte, setDifficulte] = useState("facile");
  const [formulaireDefiOuvert, setFormulaireDefiOuvert] = useState(false);
  const [defiMomentOuvert, setDefiMomentOuvert] = useState(false);
  const [triRecent, setTriRecent] = useState(true);
  const [objectifsFiltres, setObjectifsFiltres] = useState([]);
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const [defiEnEdition, setDefiEnEdition] = useState(null);
  const [formObjectif, setFormObjectif] = useState(null);
  const [nomObjectif, setNomObjectif] = useState("");
  const [couleurObjectifChoisie, setCouleurObjectifChoisie] = useState("bleu");
  const [objectifErreur, setObjectifErreur] = useState("");
  const [completionSuspendue, setCompletionSuspendue] = useState(false);
  const [difficulteACompleter, setDifficulteACompleter] = useState("facile");
  const [donneesChargees, setDonneesChargees] = useState(false);
  const [erreurChargement, setErreurChargement] = useState("");
  const [erreurSauvegarde, setErreurSauvegarde] = useState("");
  const [erreurGestionDefis, setErreurGestionDefis] = useState("");
  const [accueilOuvert, setAccueilOuvert] = useState(() => !lireAccueil().termine);

  useEffect(() => {
    async function initialiser() {
      try {
        await initialiserSauvegarde();
        // Si l'utilisateur a déjà demandé la protection, on redemande discrètement à chaque lancement
        if (lireAccueil().persistantDemande) await demanderPersistant(false);
        else await rafraichirPersistant();
        const donnees = await chargerDonneesDefis();
        const joursCharges = await chargerJours();
        const gestionDefisChargee = await chargerGestionDefis();
        setDefis(donnees.defis);
        setObjectifs(donnees.objectifs);
        setJours(joursCharges);
        setGestionDefis(gestionDefisChargee);
        setDatesTiragesAConfirmer(datesAvecTirageInterdit(joursCharges, cleDeDemain()));
        setDonneesChargees(true);
      } catch (erreur) {
        console.error("Impossible de charger les défis.", erreur);
        setErreurChargement("Impossible de charger les défis. Tes défis existants n'ont pas été supprimés ; recharge l'application pour réessayer.");
      }
    }
    initialiser();
  }, []);

  const defisManquants = defis.filter((defi) => defiIncomplet(defi, objectifs));
  const defiACompleter = donneesChargees ? defisManquants[0] || null : null;
  const recompenses = calculerRecompenses(jours);

  function aller(id) {
    setOnglet(id);
    setMenuOuvert(false);
  }

  function terminerAccueil() {
    ecrireAccueil({ termine: true });
    setAccueilOuvert(false);
  }

  async function majJour(cle, patch) {
    const aujourdhui = cleDate(new Date());
    if (cle > cleDeDemain()) throw new Error("Le calendrier ne peut être modifié que jusqu’à demain.");
    if (cle < aujourdhui) {
      const jourExistant = jours[cle];
      const propositionsExistantes = Array.isArray(jourExistant?.propositions) ? jourExistant.propositions : [];
      if (!jourExistant || (!jourExistant.choisi && propositionsExistantes.length === 0)) {
        throw new Error("Un jour passé sans tirage existant ne peut pas être modifié.");
      }
      if ("propositions" in patch) {
        throw new Error("Il n’est pas possible de tirer des défis pour un jour passé.");
      }
      if (patch.choisi && !propositionsExistantes.includes(patch.choisi)) {
        throw new Error("Pour un jour passé, tu peux uniquement choisir une carte déjà tirée.");
      }
    }
    const nouveau = { ...jours, [cle]: { ...jours[cle], ...patch } };
    await sauvegarderJours(nouveau);
    setJours(nouveau);
  }

  async function enregistrerGestionDefis(nouvelleGestion) {
    await sauvegarderGestionDefis(nouvelleGestion);
    setGestionDefis(nouvelleGestion);
  }

  async function modifierGestionDefis(patch) {
    setErreurGestionDefis("");
    try {
      await enregistrerGestionDefis({ ...gestionDefis, ...patch });
    } catch (erreur) {
      setErreurGestionDefis(erreur.message);
    }
  }

  async function confirmerNettoyageTirages() {
    setNettoyageEnCours(true);
    setErreurNettoyage("");
    const nouveauxJours = { ...jours };
    for (const date of datesTiragesAConfirmer) delete nouveauxJours[date];
    try {
      await sauvegarderJours(nouveauxJours);
      setJours(nouveauxJours);
      setDatesTiragesAConfirmer([]);
    } catch (erreur) {
      console.error("Impossible de nettoyer les anciens tirages.", erreur);
      setErreurNettoyage(erreur.message);
    } finally {
      setNettoyageEnCours(false);
    }
  }

  async function ajouterDefi() {
    if (!titre.trim() || !objectifs.some((objectif) => objectif.id === objectifId) || !DIFFICULTES.includes(difficulte)) return;
    const nouveau = {
      id: crypto.randomUUID(),
      titre: titre.trim(),
      description: description.trim(),
      image: null,
      objectifId,
      difficulte,
      dateCreation: dateActuelleISO(),
    };
    const liste = [...defis, nouveau];
    try {
      await sauvegarderDefis(liste);
      setDefis(liste);
      setTitre("");
      setDescription("");
      setObjectifId("");
      setDifficulte("facile");
      setFormulaireDefiOuvert(false);
      setErreurSauvegarde("");
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
    }
  }

  async function completerDefi() {
    if (!defiACompleter) return;
    const objectifValide = objectifs.some((objectif) => objectif.id === defiACompleter.objectifId);
    const objectifChoisi = objectifValide ? defiACompleter.objectifId : objectifId;
    const difficulteChoisie = DIFFICULTES.includes(defiACompleter.difficulte) ? defiACompleter.difficulte : difficulteACompleter;
    if (!objectifs.some((objectif) => objectif.id === objectifChoisi) || !DIFFICULTES.includes(difficulteChoisie)) return;
    const liste = defis.map((d) =>
      d.id === defiACompleter.id
        ? { ...d, objectifId: objectifChoisi, difficulte: difficulteChoisie }
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
    const suivant = liste.find((defi) => defiIncomplet(defi, objectifs));
    if (suivant) {
      setObjectifId(suivant.objectifId || "");
      setDifficulteACompleter(DIFFICULTES.includes(suivant.difficulte) ? suivant.difficulte : "facile");
    } else {
      setObjectifId("");
      setDifficulteACompleter("facile");
    }
  }

  async function supprimerDefi(id) {
    const liste = defis.filter((d) => d.id !== id);
    try {
      await sauvegarderDefis(liste);
      setDefis(liste);
      if (gestionDefis.defiDuMomentId === id) {
        const gestionReinitialisee = { ...gestionDefis, defiDuMomentId: "", defiDuMomentActif: false };
        try {
          await enregistrerGestionDefis(gestionReinitialisee);
        } catch (erreur) {
          setErreurSauvegarde(erreur.message);
          return;
        }
      }
      setErreurSauvegarde("");
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
    }
  }

  function ouvrirCreationObjectif() {
    setFormObjectif("nouveau");
    setNomObjectif("");
    setCouleurObjectifChoisie("bleu");
    setObjectifErreur("");
  }

  function ouvrirEditionObjectif(objectif) {
    setFormObjectif(objectif.id);
    setNomObjectif(objectif.nom);
    setCouleurObjectifChoisie(objectif.couleur);
    setObjectifErreur("");
  }

  async function enregistrerObjectif() {
    const nom = nomObjectif.trim().replace(/\s+/g, " ");
    if (!nom) {
      setObjectifErreur("Saisis un nom pour cet objectif.");
      return;
    }
    if (objectifs.some((objectif) =>
      objectif.id !== formObjectif && objectif.nom.toLocaleLowerCase("fr") === nom.toLocaleLowerCase("fr")
    )) {
      setObjectifErreur("Un objectif porte déjà ce nom.");
      return;
    }
    const liste = formObjectif === "nouveau"
      ? [...objectifs, { id: crypto.randomUUID(), nom, couleur: couleurObjectifChoisie }]
      : objectifs.map((objectif) =>
        objectif.id === formObjectif ? { ...objectif, nom, couleur: couleurObjectifChoisie } : objectif
      );
    try {
      await sauvegarderObjectifs(liste);
      setObjectifs(liste);
      setFormObjectif(null);
      setObjectifErreur("");
      setErreurSauvegarde("");
      setCompletionSuspendue(false);
    } catch (erreur) {
      setObjectifErreur(erreur.message);
    }
  }

  async function supprimerObjectif(objectif) {
    const nbDefis = defis.filter((defi) => defi.objectifId === objectif.id).length;
    if (nbDefis > 0) {
      ouvrirEditionObjectif(objectif);
      setObjectifErreur(`Impossible de supprimer « ${objectif.nom} » : ${nbDefis} défi${nbDefis > 1 ? "s y sont rattachés" : " y est rattaché"}. Tu peux plutôt le renommer.`);
      return;
    }
    if (!window.confirm(`Supprimer l’objectif « ${objectif.nom} » ?`)) return;
    const liste = objectifs.filter((element) => element.id !== objectif.id);
    try {
      await sauvegarderObjectifs(liste);
      setObjectifs(liste);
      setObjectifsFiltres((actifs) => actifs.filter((id) => id !== objectif.id));
      setObjectifErreur("");
    } catch (erreur) {
      setObjectifErreur(erreur.message);
    }
  }

  function commencerEditionDefi(defi) {
    setDefiEnEdition({
      id: defi.id,
      titre: defi.titre,
      description: defi.description || "",
      objectifId: defi.objectifId || "",
      difficulte: DIFFICULTES.includes(defi.difficulte) ? defi.difficulte : "facile",
    });
  }

  async function enregistrerEditionDefi() {
    if (!defiEnEdition?.titre.trim() ||
      !objectifs.some((objectif) => objectif.id === defiEnEdition.objectifId) ||
      !DIFFICULTES.includes(defiEnEdition.difficulte)) return;
    const liste = defis.map((defi) => defi.id === defiEnEdition.id
      ? {
        ...defi,
        titre: defiEnEdition.titre.trim(),
        description: defiEnEdition.description.trim(),
        objectifId: defiEnEdition.objectifId,
        difficulte: defiEnEdition.difficulte,
      }
      : defi
    );
    try {
      await sauvegarderDefis(liste);
      setDefis(liste);
      setDefiEnEdition(null);
      setErreurSauvegarde("");
    } catch (erreur) {
      setErreurSauvegarde(erreur.message);
    }
  }

  function basculerObjectifFiltre(id) {
    setObjectifsFiltres((actifs) => actifs.includes(id)
      ? actifs.filter((objectifIdActif) => objectifIdActif !== id)
      : [...actifs, id]
    );
  }

  function basculerDifficulteFiltre(niveau) {
    setDifficultesFiltrees((actifs) => actifs.includes(niveau)
      ? actifs.filter((difficulteActive) => difficulteActive !== niveau)
      : [...actifs, niveau]
    );
  }

  return (
    <div>
      <header className="entete" inert={datesTiragesAConfirmer.length > 0}>
        <button className="btn icone" onClick={() => setMenuOuvert(true)} aria-label="Menu">
          ☰
        </button>
        <h1 className="logo">
          <span>Habi</span>bits
        </h1>
        <Indicateur onClick={() => aller("parametres")} />
      </header>

      {menuOuvert && <div className="voile" onClick={() => setMenuOuvert(false)} />}

      <nav className={`panneau ${menuOuvert ? "ouvert" : ""}`} inert={datesTiragesAConfirmer.length > 0}>
        <button className="btn icone fermer" onClick={() => setMenuOuvert(false)}>
          ✕
        </button>
        <div className="panneau-titre">Menu</div>
        {SECTIONS.filter((s) => !["regles", "parametres"].includes(s.id)).map((s) => (
          <button key={s.id} className={`lien ${onglet === s.id ? "actif" : ""}`} onClick={() => aller(s.id)}>
            {s.label}
          </button>
        ))}
        <div className="menu-bas">
          <button className={`lien ${onglet === "regles" ? "actif" : ""}`} onClick={() => aller("regles")}>
            {SECTIONS.find((s) => s.id === "regles").label}
          </button>
          <button className={`lien ${onglet === "parametres" ? "actif" : ""}`} onClick={() => aller("parametres")}>
            {SECTIONS.find((s) => s.id === "parametres").label}
          </button>
          <button className={`lien ${onglet === A_PROPOS.id ? "actif" : ""}`} onClick={() => aller(A_PROPOS.id)}>
            {A_PROPOS.label}
          </button>
        </div>
      </nav>

      <main className="contenu">
        <Bandeaux />

        {onglet === "calendrier" && (
          <Calendrier
            defis={defis}
            objectifs={objectifs}
            jours={jours}
            recompenses={recompenses}
            defiDuMoment={gestionDefis.defiDuMomentActif
              ? defis.find((defi) => defi.id === gestionDefis.defiDuMomentId) || null
              : null}
            frequenceHebdoDefiMoment={gestionDefis.frequencesHebdo?.[gestionDefis.defiDuMomentId] || 3}
            datesTiragesAConfirmer={datesTiragesAConfirmer}
            lectureSeule={datesTiragesAConfirmer.length > 0}
            onMajJour={majJour}
            onAllerDefis={() => aller("defis")}
          />
        )}

        {onglet === "regles" && <Regles />}
        {onglet === "collection" && (
          <Collection
            defis={defis}
            objectifs={objectifs}
            jours={jours}
            recompenses={recompenses}
            gestionDefis={gestionDefis}
          />
        )}
        {onglet === "notes" && (
          <Notes defis={defis} objectifs={objectifs} jours={jours} recompenses={recompenses} />
        )}

        {onglet === "defis" && (
          <div>
            <p className="jour-titre description-mes-defis">
              Relève tes <span>défis</span> pour atteindre tes <span>objectifs</span>
            </p>
            <section aria-labelledby="titre-objectifs">
              <div className="entete-section">
                <h2 id="titre-objectifs" className="jour-titre">Mes objectifs ({objectifs.length})</h2>
                <button className="btn petit" onClick={ouvrirCreationObjectif}>+ Créer un objectif</button>
              </div>
              {objectifErreur && <p className="attention" role="alert">{objectifErreur}</p>}
              {objectifs.length === 0 && <p className="note">Crée un objectif ici avant d’ajouter tes défis.</p>}
              <div className="liste-objectifs">
                {objectifs.map((objectif) => {
                  const nombre = defis.filter((defi) => defi.objectifId === objectif.id).length;
                  return (
                    <div
                      key={objectif.id}
                      className={`tuile objectif-tuile ${objectifsFiltres.includes(objectif.id) ? "selectionne" : ""}`}
                      style={{ "--couleur": couleurObjectif(objectif.couleur) }}
                    >
                      <div className="objectif-ligne">
                        <button
                          className="objectif-filtre"
                          onClick={() => basculerObjectifFiltre(objectif.id)}
                          aria-pressed={objectifsFiltres.includes(objectif.id)}
                        >
                          <span className="objectif-nom" style={{ color: couleurObjectif(objectif.couleur) }}>{objectif.nom}</span>
                          <span className="objectif-compte">{nombre}</span>
                        </button>
                        <div className="actions">
                          <button className="btn petit discret" onClick={() => ouvrirEditionObjectif(objectif)}
                            aria-label={`Modifier l’objectif ${objectif.nom}`} title="Modifier">✏️</button>
                          <button className="btn petit danger" onClick={() => supprimerObjectif(objectif)}
                            aria-label={`Supprimer l’objectif ${objectif.nom}`} title="Supprimer">🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {formObjectif && (
                <div className="tuile formulaire-objectif">
                  <h3>{formObjectif === "nouveau" ? "Créer un objectif" : "Modifier un objectif"}</h3>
                  <label className="champ-label" htmlFor="nom-objectif">Nom</label>
                  <input id="nom-objectif" value={nomObjectif} onChange={(e) => setNomObjectif(e.target.value)} autoFocus />
                  <span className="champ-label">Couleur</span>
                  <div className="palette-objectifs" role="radiogroup" aria-label="Couleur de l’objectif">
                    {COULEURS_OBJECTIF.map((couleur) => (
                      <button
                        key={couleur.id}
                        type="button"
                        className={`choix-couleur ${couleurObjectifChoisie === couleur.id ? "selectionne" : ""}`}
                        style={{ "--couleur": couleur.valeur }}
                        onClick={() => setCouleurObjectifChoisie(couleur.id)}
                        role="radio"
                        aria-checked={couleurObjectifChoisie === couleur.id}
                        aria-label={couleur.nom}
                        title={couleur.nom}
                      />
                    ))}
                  </div>
                  {objectifErreur && <p className="attention" role="alert">{objectifErreur}</p>}
                  <div className="actions">
                    <button className="btn" onClick={enregistrerObjectif}>Enregistrer</button>
                    <button className="btn discret" onClick={() => { setFormObjectif(null); setObjectifErreur(""); }}>Annuler</button>
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="titre-defis">
              <div className="defis-entete">
                <h2 id="titre-defis" className="jour-titre">Mes défis ({defis.length})</h2>
                <button
                  className="btn petit bouton-defi-moment"
                  aria-expanded={defiMomentOuvert}
                  aria-controls="panneau-defi-moment"
                  onClick={() => setDefiMomentOuvert((ouvert) => !ouvert)}
                >
                  {defiMomentOuvert ? "Fermer" : "Défi du moment"}
                </button>
                {objectifs.length > 0 && (
                  <button className="btn petit" onClick={() => setFormulaireDefiOuvert(!formulaireDefiOuvert)}>
                    {formulaireDefiOuvert ? "Annuler" : "+ Créer un défi"}
                  </button>
                )}
              </div>
              {defiMomentOuvert && (
                <div id="panneau-defi-moment" className="tuile panneau-defi-moment">
                  <h3>Défi du moment</h3>
                  <p>
                    Choisis un défi qui apparaîtra à chaque tirage tant que l’option est activée. Il remplacera la carte
                    aléatoire de sa difficulté : le tirage conservera trois cartes.
                  </p>
                  <p>Chaque réussite rapporte 💩 1 (facile), 💩 3 (moyen) ou 💩 5 (difficile).</p>
                  <label className="champ-label" htmlFor="defi-du-moment">Défi à mettre en avant</label>
                  <select
                    id="defi-du-moment"
                    value={gestionDefis.defiDuMomentId}
                    onChange={(event) => {
                      const defiId = event.target.value;
                      modifierGestionDefis({
                        defiDuMomentId: defiId,
                        defiDuMomentActif: defiId ? gestionDefis.defiDuMomentActif : false,
                        frequencesHebdo: defiId
                          ? {
                            ...gestionDefis.frequencesHebdo,
                            [defiId]: gestionDefis.frequencesHebdo?.[defiId] || 3,
                          }
                          : gestionDefis.frequencesHebdo,
                      });
                    }}
                  >
                    <option value="">Choisir un défi</option>
                    {defis.map((defi) => (
                      <option key={defi.id} value={defi.id}>
                        {defi.titre} — {defi.difficulte}
                      </option>
                    ))}
                  </select>
                  {gestionDefis.defiDuMomentId && (
                    <>
                      <label className="champ-label" htmlFor="frequence-defi-moment">
                        Objectif hebdomadaire
                      </label>
                      <select
                        id="frequence-defi-moment"
                        value={gestionDefis.frequencesHebdo?.[gestionDefis.defiDuMomentId] || 3}
                        onChange={(event) => modifierGestionDefis({
                          frequencesHebdo: {
                            ...gestionDefis.frequencesHebdo,
                            [gestionDefis.defiDuMomentId]: Number(event.target.value),
                          },
                        })}
                      >
                        {Array.from({ length: 7 }, (_, index) => index + 1).map((nombre) => (
                          <option key={nombre} value={nombre}>
                            {nombre} fois par semaine
                          </option>
                        ))}
                      </select>
                      <p className="note">
                        Une fois cet objectif atteint entre lundi et dimanche, tu reçois en bonus autant de cacas que ce défi
                        t’en a rapportés cette semaine. Le seuil est fixé à la première validation du défi chaque semaine ;
                        si tu le changes ensuite, le nouveau seuil s’appliquera la semaine suivante.
                      </p>
                    </>
                  )}
                  <label className="case-a-cocher">
                    <input
                      type="checkbox"
                      checked={gestionDefis.defiDuMomentActif}
                      disabled={!gestionDefis.defiDuMomentId}
                      onChange={(event) => modifierGestionDefis({ defiDuMomentActif: event.target.checked })}
                    />
                    Activer le défi du moment
                  </label>
                  {erreurGestionDefis && <p className="attention" role="alert">{erreurGestionDefis}</p>}
                  {!defis.length && <p className="note">Crée d’abord un défi dans la liste ci-dessous.</p>}
                </div>
              )}
              <div className="filtres-defis">
                <div className="filtres-difficulte" aria-label="Filtrer par difficulté">
                {DIFFICULTES.map((niveau) => (
                  <button
                    key={niveau}
                    className={`btn petit filtre-difficulte ${difficultesFiltrees.includes(niveau) ? "actif" : "discret"}`}
                    aria-pressed={difficultesFiltrees.includes(niveau)}
                    onClick={() => basculerDifficulteFiltre(niveau)}
                  >
                    {niveau[0].toUpperCase() + niveau.slice(1)}
                    <IndicateurDifficulte difficulte={niveau} decoratif />
                  </button>
                ))}
                <div className="filtres-tri" aria-label="Trier les défis par date">
                  <button className={`btn petit filtre-difficulte ${triRecent ? "actif" : "discret"}`}
                    onClick={() => setTriRecent(true)} aria-pressed={triRecent}>
                    Récent
                  </button>
                  <button className={`btn petit filtre-difficulte ${!triRecent ? "actif" : "discret"}`}
                    onClick={() => setTriRecent(false)} aria-pressed={!triRecent}>
                    Ancien
                  </button>
                </div>
                </div>
              </div>
              {erreurSauvegarde && <p className="attention" role="alert">{erreurSauvegarde}</p>}
              {!objectifs.length && (
                <div className="tuile">
                  <h3>Ajouter un défi</h3>
                  <p>Crée d’abord un objectif dans la section « Mes objectifs ».</p>
                </div>
              )}
              {objectifs.length > 0 && formulaireDefiOuvert && (
                <div className="tuile">
                  <h3>Ajouter un défi</h3>
                  <input placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
                  <textarea
                    placeholder="Description (facultatif)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <label className="champ-label" htmlFor="objectif-defi">Objectif *</label>
                  <select id="objectif-defi" value={objectifId} onChange={(e) => setObjectifId(e.target.value)} required>
                    <option value="">Choisir un objectif</option>
                    {objectifs.map((objectif) => <option key={objectif.id} value={objectif.id}>{objectif.nom}</option>)}
                  </select>
                  <label className="champ-label" htmlFor="difficulte-defi">Difficulté *</label>
                  <select id="difficulte-defi" value={difficulte} onChange={(e) => setDifficulte(e.target.value)} required>
                    {DIFFICULTES.map((niveau) => <option key={niveau} value={niveau}>{niveau[0].toUpperCase() + niveau.slice(1)}</option>)}
                  </select>
                  <button className="btn" onClick={ajouterDefi}
                    disabled={!titre.trim() || !objectifs.some((objectif) => objectif.id === objectifId)}>
                    Ajouter
                  </button>
                </div>
              )}

              {defis
                .filter((defi) =>
                  (objectifsFiltres.length === 0 || objectifsFiltres.includes(defi.objectifId)) &&
                  (difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
                )
                .sort((a, b) => (triRecent ? 1 : -1) * (Date.parse(b.dateCreation) - Date.parse(a.dateCreation)))
                .map((defi) => {
                  const objectif = objectifs.find((element) => element.id === defi.objectifId);
                  const enEdition = defiEnEdition?.id === defi.id;
                  return (
                    <div key={defi.id} className="tuile defi-tuile" style={{ "--couleur": couleurObjectif(objectif?.couleur) }}>
                      {enEdition ? (
                        <>
                          <h3>Modifier le défi</h3>
                          <label className="champ-label" htmlFor={`titre-${defi.id}`}>Nom</label>
                          <input id={`titre-${defi.id}`} value={defiEnEdition.titre}
                            onChange={(e) => setDefiEnEdition({ ...defiEnEdition, titre: e.target.value })} />
                          <label className="champ-label" htmlFor={`description-${defi.id}`}>Description</label>
                          <textarea id={`description-${defi.id}`} value={defiEnEdition.description}
                            onChange={(e) => setDefiEnEdition({ ...defiEnEdition, description: e.target.value })} />
                          <label className="champ-label" htmlFor={`objectif-edit-${defi.id}`}>Objectif</label>
                          <select id={`objectif-edit-${defi.id}`} value={defiEnEdition.objectifId}
                            onChange={(e) => setDefiEnEdition({ ...defiEnEdition, objectifId: e.target.value })}>
                            <option value="">Choisir un objectif</option>
                            {objectifs.map((element) => <option key={element.id} value={element.id}>{element.nom}</option>)}
                          </select>
                          <label className="champ-label" htmlFor={`difficulte-edit-${defi.id}`}>Difficulté</label>
                          <select id={`difficulte-edit-${defi.id}`} value={defiEnEdition.difficulte}
                            onChange={(e) => setDefiEnEdition({ ...defiEnEdition, difficulte: e.target.value })}>
                            {DIFFICULTES.map((niveau) => <option key={niveau} value={niveau}>{niveau[0].toUpperCase() + niveau.slice(1)}</option>)}
                          </select>
                          <div className="actions">
                            <button className="btn petit" onClick={enregistrerEditionDefi}
                              disabled={!defiEnEdition.titre.trim() || !objectifs.some((element) => element.id === defiEnEdition.objectifId)}>
                              Enregistrer
                            </button>
                            <button className="btn petit discret" onClick={() => setDefiEnEdition(null)}>Annuler</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="defi-corps">
                            <div className="defi-contenu">
                              <h3>{defi.titre}</h3>
                              {defi.description && <p>{defi.description}</p>}
                            </div>
                            <div className="defi-actions">
                              <span className="defi-difficulte" aria-label={`Difficulté ${defi.difficulte}`} title={`Difficulté ${defi.difficulte}`}>
                                <IndicateurDifficulte difficulte={defi.difficulte} />
                              </span>
                              <div className="actions">
                                <button className="btn discret action-defi" onClick={() => commencerEditionDefi(defi)}
                                  aria-label={`Modifier le défi ${defi.titre}`} title="Modifier">✏️</button>
                                <button className="btn danger action-defi" onClick={() => supprimerDefi(defi.id)}
                                  aria-label={`Supprimer le défi ${defi.titre}`} title="Supprimer">🗑️</button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              {defis.length > 0 && defis.filter((defi) =>
                (objectifsFiltres.length === 0 || objectifsFiltres.includes(defi.objectifId)) &&
                (difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
              ).length === 0 && <p>Aucun défi ne correspond aux filtres.</p>}
            </section>
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
        {onglet === "apropos" && (
          <section className="tuile apropos" aria-labelledby="titre-apropos">
            <h2 id="titre-apropos">La vision Habibits</h2>
            <p>
              Quand on veut atteindre ses objectifs, tenir de nouvelles habitudes n’est pas toujours facile,
              à court comme à long terme. Habibits part d’une autre idée : plutôt que de toujours essayer de
              se changer soi-même, on peut adapter son environnement pour rendre les choses plus simples.
            </p>
            <p>
              Ici, de petits défis aident à avancer pas à pas, jour après jour, sans transformer ses objectifs
              en corvées. L’application suit le rythme de chacun et laisse de la place aux variations d’énergie,
              aux difficultés du quotidien et aux facteurs extérieurs.
            </p>
            <p>
              L’idée est de se laisser porter par un cadre souple pour concrétiser ses objectifs, à son rythme.
            </p>
            <h3>Gratuite et sans publicité</h3>
            <p>
              Habibits est gratuite, sans publicité, et le restera. Il y a déjà assez de choses payantes dans la vie ;
              les publicités et la logique du capitalisme prennent assez de place et nous épuisent. Cette application
              veut rester un espace libre, sans pression commerciale.
            </p>
          </section>
        )}
      </main>

      {accueilOuvert && datesTiragesAConfirmer.length === 0 && <Accueil onTermine={terminerAccueil} />}
      {defiACompleter && !completionSuspendue && datesTiragesAConfirmer.length === 0 && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-completion">
          <div className="tuile">
            <h2 id="titre-completion">Compléter tes défis</h2>
            <p>Pour continuer, ajoute les informations manquantes à ce défi :</p>
            <h3>{defiACompleter.titre}</h3>
            {!objectifs.some((objectif) => objectif.id === defiACompleter.objectifId) && objectifs.length > 0 && (
              <>
                <label className="champ-label" htmlFor="objectif-completion">Objectif *</label>
                <select id="objectif-completion" value={objectifId} onChange={(e) => setObjectifId(e.target.value)} required autoFocus>
                  <option value="">Choisir un objectif</option>
                  {objectifs.map((objectif) => <option key={objectif.id} value={objectif.id}>{objectif.nom}</option>)}
                </select>
              </>
            )}
            {objectifs.length === 0 && (
              <>
                <p className="attention">Crée d’abord un objectif dans la section « Mes défis ».</p>
                <button className="btn" onClick={() => {
                  setCompletionSuspendue(true);
                  setOnglet("defis");
                }}>
                  Ouvrir « Mes objectifs »
                </button>
              </>
            )}
            {!DIFFICULTES.includes(defiACompleter.difficulte) && (
              <>
                <label className="champ-label" htmlFor="difficulte-completion">Difficulté *</label>
                <select id="difficulte-completion" value={difficulteACompleter} onChange={(e) => setDifficulteACompleter(e.target.value)} required>
                  {DIFFICULTES.map((niveau) => <option key={niveau} value={niveau}>{niveau[0].toUpperCase() + niveau.slice(1)}</option>)}
                </select>
              </>
            )}
            {objectifs.length > 0 && (
              <button className="btn" onClick={completerDefi}
                disabled={!objectifs.some((objectif) => objectif.id === (objectifId || defiACompleter.objectifId)) ||
                  !DIFFICULTES.includes(DIFFICULTES.includes(defiACompleter.difficulte) ? defiACompleter.difficulte : difficulteACompleter)}>
                Enregistrer et continuer
              </button>
            )}
            <p className="note">Défi {defisManquants.findIndex((d) => d.id === defiACompleter.id) + 1} sur {defisManquants.length}</p>
            {erreurSauvegarde && <p className="attention" role="alert">{erreurSauvegarde}</p>}
          </div>
        </div>
      )}
      {datesTiragesAConfirmer.length > 0 && (
        <section className="nettoyage-tirages" role="alert" aria-labelledby="titre-nettoyage-tirages">
          <div className="tuile">
            <h2 id="titre-nettoyage-tirages">Mise à jour des règles du calendrier</h2>
            <p>
              À partir de maintenant, un tirage ne sera possible que pour aujourd’hui ou demain. Les tirages et défis
              choisis à partir d’après-demain ({datesTiragesAConfirmer.length} jour{datesTiragesAConfirmer.length > 1 ? "s" : ""})
              seront supprimés pour appliquer cette règle.
            </p>
            <p>Si tu souhaites en garder une trace, fais une capture d’écran maintenant. Rien ne sera supprimé avant ta confirmation.</p>
            {erreurNettoyage && <p className="attention" role="alert">{erreurNettoyage}</p>}
            <button className="btn" onClick={confirmerNettoyageTirages} disabled={nettoyageEnCours}>
              {nettoyageEnCours ? "Nettoyage en cours…" : "J’ai fait ma capture d’écran, supprimer ces tirages"}
            </button>
          </div>
        </section>
      )}
      {!donneesChargees && !erreurChargement && datesTiragesAConfirmer.length === 0 && (
        <div className="completion-defi" role="status">
          <div className="tuile"><p>Chargement et préparation de tes données…</p></div>
        </div>
      )}
      {erreurChargement && datesTiragesAConfirmer.length === 0 && (
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
