import { useState } from "react";
import { cleDate, grilleDuMois } from "./dates";
import { couleurObjectif } from "./objectifs";
import { calculerRecompenses, recompensePourDifficulte } from "./recompenses";
import { OBJETS, calculerObjets, messageMiroir, pommesBonusObjets } from "./objets";
import { tirerDefis } from "./tirage";
import IndicateurDifficulte from "./IndicateurDifficulte";

const NOMS_JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const DIFFICULTES = ["facile", "moyen", "difficile"];

function BarresDe({ nombre, couleur }) {
  return (
    <svg width="44" height="40" viewBox="0 0 44 40">
      {[14, 24, 34].map((h, i) => (
        <rect key={h} x={2 + i * 14} y={36 - h} width="10" height={h} rx="1"
          fill={i < nombre ? couleur : "rgba(234,242,255,0.25)"} />
      ))}
    </svg>
  );
}

const VCOCHE_DE = (
  <svg width="56" height="44" viewBox="0 0 56 44">
    <path d="M8 24 L22 38 L48 8" fill="none" stroke="#eaf2ff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// La face 1 est celle qui apparaît devant au repos.
const FACES_DE = [
  <BarresDe key="facile" nombre={1} couleur="#3fae74" />,
  VCOCHE_DE,
  <BarresDe key="moyen" nombre={2} couleur="#e08a2d" />,
  <BarresDe key="difficile" nombre={3} couleur="#d0483f" />,
];

export default function Calendrier({
  defis,
  objectifs = [],
  jours,
  recompenses,
  defiDuMoment = null,
  frequenceHebdoDefiMoment = 3,
  datesTiragesAConfirmer = [],
  limite,
  lectureSeule = false,
  onMajJour,
  onAllerDefis,
  onAllerCollection,
  onAllerNotes,
  onAllerObjets,
}) {
  const [mois, setMois] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [aujourdhui] = useState(() => cleDate(new Date()));
  const demain = limite;
  const [selection, setSelection] = useState(aujourdhui);
  const [alerteTirage, setAlerteTirage] = useState(false);
  const [deLance, setDeLance] = useState(false);
  const [erreurTirage, setErreurTirage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [gain, setGain] = useState(null);
  const [miroirAffiche, setMiroirAffiche] = useState("");
  const [noteEchec, setNoteEchec] = useState("");

  async function maj(cle, patch) {
    try {
      await onMajJour(cle, patch);
      setErreurTirage("");
      return true;
    } catch (erreur) {
      setErreurTirage(erreur.message);
      return false;
    }
  }

  async function confirmerAction() {
    if (confirmation.type === "choisir") {
      if (await maj(selection, { choisi: confirmation.defi.id })) setConfirmation(null);
    } else if (confirmation.type === "valider") {
      const objectif = objectifs.find((item) => item.id === defiChoisi.objectifId);
      const patch = {
        fait: true,
        collectionProposable: true,
        nonReussi: false,
        note: "",
        defiCopie: { ...defiChoisi },
        objectifCopie: objectif ? { ...objectif } : null,
        recompenseCaca: recompensePourDifficulte(defiChoisi.difficulte),
        defiDuMomentIdLorsValidation: defiDuMoment?.id === defiChoisi.id ? defiChoisi.id : null,
        objectifHebdoDefiMoment: defiDuMoment?.id === defiChoisi.id ? frequenceHebdoDefiMoment : null,
      };
      const joursApres = { ...jours, [selection]: { ...jours[selection], ...patch } };
      const recompensesAvant = calculerRecompenses(jours);
      const recompensesApres = calculerRecompenses(joursApres);
      const objetsAvant = calculerObjets(jours).gagnes;
      const objetsApres = calculerObjets(joursApres).gagnes;
      const objetsGagnes = OBJETS.filter((objet) => objetsApres[objet.id] > objetsAvant[objet.id]).map((objet) => ({
        ...objet,
        nombre: objetsApres[objet.id] - objetsAvant[objet.id],
      }));
      if (await maj(selection, patch)) {
        setConfirmation(null);
        const montant = recompensesApres.recompenses - recompensesAvant.recompenses;
        const bonus = recompensesApres.bonus - recompensesAvant.bonus;
        const pommes = recompensesApres.solde + recompensesApres.coeurs -
          recompensesAvant.solde - recompensesAvant.coeurs +
          pommesBonusObjets(joursApres) - pommesBonusObjets(jours);
        if (montant > 0) setGain({ type: "cacas", montant, bonus: Math.max(0, bonus), pommes, objetsGagnes });
      }
    } else if (confirmation.type === "valider2") {
      const patch = { fuseeValidee: true, recompenseCaca: recompensePourDifficulte(defiChoisi.difficulte) * 2 };
      const joursApres = { ...jours, [selection]: { ...jours[selection], ...patch } };
      const recompensesAvant = calculerRecompenses(jours);
      const recompensesApres = calculerRecompenses(joursApres);
      if (await maj(selection, patch)) {
        setConfirmation(null);
        const montant = recompensesApres.recompenses - recompensesAvant.recompenses;
        const bonus = recompensesApres.bonus - recompensesAvant.bonus;
        const pommes = recompensesApres.solde + recompensesApres.coeurs -
          recompensesAvant.solde - recompensesAvant.coeurs +
          pommesBonusObjets(joursApres) - pommesBonusObjets(jours);
        if (montant > 0) setGain({ type: "cacas", montant, bonus: Math.max(0, bonus), pommes, objetsGagnes: [] });
      }
    } else if (confirmation.type === "echec") {
      const objectif = objectifs.find((item) => item.id === defiChoisi.objectifId);
      const patch = {
        fait: false,
        nonReussi: true,
        note: noteEchec.trim(),
        collectionProposable: false,
        collectionne: false,
        defiCopie: { ...defiChoisi },
        objectifCopie: objectif ? { ...objectif } : null,
        recompenseCaca: 0,
        defiDuMomentIdLorsValidation: null,
        objectifHebdoDefiMoment: null,
      };
      const recompensesAvant = calculerRecompenses(jours);
      const recompensesApres = calculerRecompenses({
        ...jours,
        [selection]: { ...jours[selection], ...patch },
      });
      if (await maj(selection, patch)) {
        setConfirmation(null);
        setNoteEchec("");
        setMiroirAffiche(messageMiroir(jours));
        const montant = recompensesApres.coeurs - recompensesAvant.coeurs;
        const pommes = recompensesApres.solde + recompensesApres.coeurs -
          recompensesAvant.solde - recompensesAvant.coeurs;
        if (montant > 0) setGain({ type: "coeur", montant, pommes });
      }
    }
  }

  const trouver = (id) => defis.find((d) => d.id === id);
  const donneesAnciennesVisibles = (cle) => datesTiragesAConfirmer.includes(cle);
  const couleurDefi = (defi, objectifCopie = null) =>
    couleurObjectif(
      objectifs.find((objectif) => objectif.id === defi?.objectifId)?.couleur || objectifCopie?.couleur
    );
  const cases = grilleDuMois(mois.getFullYear(), mois.getMonth());
  const jour = selection <= demain || donneesAnciennesVisibles(selection) ? jours[selection] || {} : {};
  const defiChoisi = jour.choisi ? trouver(jour.choisi) || jour.defiCopie : null;
  const propositions = (jour.propositions || []).map(trouver).filter(Boolean);
  const modifiable = !lectureSeule && selection >= aujourdhui && selection <= demain;
  const jourPasseAvecTirage = !lectureSeule && selection < aujourdhui &&
    Boolean(jour.choisi || propositions.length > 0);
  const jourRepos = jour.objetUtilise === "lotus" && !jour.fait;
  const peutModifierEtat = !lectureSeule && selection <= aujourdhui && Boolean(jour.choisi) && !jourRepos;
  const defiImpose = jour.dauphinDefiId ? trouver(jour.dauphinDefiId) || null : null;
  const difficultesManquantes = DIFFICULTES.filter(
    (difficulte) => !defis.some((defi) => defi.difficulte === difficulte)
  );

  function changerMois(delta) {
    setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1));
  }

  function lancerDe() {
    if (deLance) return;
    setDeLance(true);
    setTimeout(() => {
      setDeLance(false);
      preparerTirage();
    }, 1650);
  }

  function preparerTirage(continuerSansToutesLesDifficultes = false) {
    if (difficultesManquantes.length && !continuerSansToutesLesDifficultes) {
      setAlerteTirage(true);
      setErreurTirage("");
      return;
    }

    setAlerteTirage(false);
    const tirage = tirerDefis(defis, defiDuMoment, defiImpose);
    if (!tirage) {
      setErreurTirage("Il faut au moins trois défis distincts pour tirer trois cartes.");
      return;
    }

    setErreurTirage("");
    maj(selection, { propositions: tirage.map((defi) => defi.id) });
  }

  return (
    <div>
      <div className="mois-barre">
        <button className="btn icone" onClick={() => changerMois(-1)}>‹</button>
        <h2 className="mois">
          {mois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </h2>
        <button className="btn icone" onClick={() => changerMois(1)}>›</button>
      </div>

      <div className="grille blueprint">
        {NOMS_JOURS.map((n, i) => (
          <div key={i} className="nom-jour">{n}</div>
        ))}
        {cases.map((date, i) => {
          if (!date) return <div key={i} />;
          const cle = cleDate(date);
          const datePrecedente = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
          const dateSuivante = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          const j = cle <= demain || donneesAnciennesVisibles(cle) ? jours[cle] || {} : {};
          const colonneSemaine = (date.getDay() + 6) % 7;
          const defi = j.choisi ? trouver(j.choisi) || j.defiCopie : null;
          let etat = "vide";
          if (j.fait) etat = "fait";
          else if (j.nonReussi) etat = "non-reussi";
          else if (j.choisi) etat = "choisi";
          else if ((j.propositions || []).length) etat = "propose";
          const classes = [
            "case",
            etat,
            j.fait && colonneSemaine > 0 && (
              date.getDate() === 1 || jours[cleDate(datePrecedente)]?.fait
            ) ? "porte-gauche" : "",
            j.fait && colonneSemaine < 6 && (
              date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() ||
              jours[cleDate(dateSuivante)]?.fait
            ) ? "porte-droite" : "",
            cle === selection ? "selection" : "",
            cle === aujourdhui ? "aujourdhui" : "",
            cle < aujourdhui ? "passe" : "",
          ].join(" ");
          return (
            <button key={i} className={classes}
              style={defi ? { "--couleur": couleurDefi(defi, j.objectifCopie) } : undefined}
              onClick={() => {
              setSelection(cle);
              setAlerteTirage(false);
              setErreurTirage("");
            }}>
              <span className="num" style={j.fait ? { color: { facile: "var(--vert)", moyen: "var(--orange)", difficile: "var(--rouge)" }[j.defiCopie?.difficulte || defi?.difficulte] } : undefined}>{date.getDate()}</span>
              {j.fait && <span className="coche">{j.defiDuMomentIdLorsValidation ? "⭐" : ""}✔</span>}
              {j.nonReussi && <span className="coche">{j.note ? "📝" : "×"}</span>}
              {j.objetUtilise === "lotus" && !j.fait && (
                <span className="case-indicateur" role="img" aria-label="Jour de repos">🪷</span>
              )}
              <span className="titre-case">{defi && !(j.objetUtilise === "lotus" && !j.fait) ? defi.titre : ""}</span>
              {!j.choisi && !j.fait && !j.nonReussi && (j.propositions || []).length > 0 && (
                <span className="case-indicateur" role="img" aria-label="Défis tirés, choix en attente">🤔</span>
              )}
              {!j.choisi && !j.fait && !j.nonReussi && !(j.propositions || []).length &&
                !lectureSeule && cle >= aujourdhui && cle <= demain && defis.length > 0 && j.objetUtilise !== "lotus" && (
                  <span className="case-indicateur de-a-quatre" role="img" aria-label="Tirer des défis">
                    🎲
                  </span>
                )}
            </button>
          );
        })}
      </div>
      <div className="comptes-recompenses comptes-recompenses-calendrier" aria-label={`${recompenses?.totalGagne || 0} cacas gagnés et ${recompenses?.coeurs || 0} cœurs bandés`}>
        <span className="comptes-recompenses-classiques">
          <span className="compte-recompense">
            <span aria-hidden="true">💩</span>
            <strong>{recompenses?.totalGagne || 0}</strong>
          </span>
          <span className="compte-recompense">
            <span aria-hidden="true">❤️‍🩹</span>
            <strong>{recompenses?.coeurs || 0}</strong>
          </span>
        </span>
        <button className="btn petit bouton-utiliser-objet" onClick={onAllerObjets}>
          <span aria-hidden="true">🎒</span> Utiliser un objet
        </button>
      </div>

      <h3 className="jour-titre">
        {new Date(selection + "T00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </h3>

      {erreurTirage && <p className="alerte-tirage" role="alert">{erreurTirage}</p>}

      {jourRepos ? (
        <div className="tuile jour-repos">
          <h3>🪷 Jour de repos</h3>
          <p>Tu as utilisé un lotus : aujourd’hui est un jour de repos bien mérité.<br />Pas de défi aujourd’hui, seulement la satisfaction d’être avec soi-même et d’écouter son corps et son esprit.</p>
        </div>
      ) : defiChoisi ? (
        <div
          className={`tuile defi-tuile ${jour.fait ? "fait" : jour.nonReussi ? "non-reussi" : "c2"}`}
          style={{ "--couleur": couleurDefi(defiChoisi, jour.objectifCopie) }}
        >
          <h3>{defiChoisi.titre}</h3>
          <p>{defiChoisi.description}</p>
          {peutModifierEtat && !jour.fait && !jour.nonReussi && (
            <div className="actions actions-validation">
              <button className="btn" onClick={() => setConfirmation({ type: "valider" })}>Valider le défi ✔</button>
              <button className="btn discret" onClick={() => {
                setNoteEchec("");
                setConfirmation({ type: "echec" });
              }}>
                Je n’ai pas réussi
              </button>
            </div>
          )}
          {jour.fait && (
            <>
              <p className="accompli">Bravo, défi accompli !</p>
              {jour.objetUtilise === "fusee" && !jour.fuseeValidee && peutModifierEtat && (
                <button className="btn" onClick={() => setConfirmation({ type: "valider2" })}>
                  Valider une 2ème fois <span aria-hidden="true">🚀</span>
                </button>
              )}
              {!jour.collectionne && jour.defiDuMomentIdLorsValidation !== jour.choisi && !lectureSeule && (
                <button className="btn" onClick={() => maj(selection, { collectionne: true })}>
                  Ajouter ma carte à la collection
                </button>
              )}
              {jour.collectionne && (
                <>
                  <p>Cette carte est dans ta collection.</p>
                  <button className="btn" onClick={onAllerCollection}>Voir ma collection</button>
                </>
              )}
            </>
          )}
          {jour.nonReussi && (
            <>
              <p className="attention">Ce défi n’a pas été réussi.</p>
              {jour.note && <p className="note-personnelle">{jour.note}</p>}
              <button className="btn" onClick={onAllerNotes}>Voir mes notes à moi-même</button>
            </>
          )}
          {lectureSeule && <p>Consultation uniquement pendant la mise à jour du calendrier.</p>}
        </div>
      ) : propositions.length > 0 ? (
        <div className="tirage-defis">
          {propositions.map((d, i) => {
            const objectif = objectifs.find((element) => element.id === d.objectifId);
            return (
              <div key={d.id} className="tirage-colonne">
                <div className={`tuile c${i} carte-tirage`} style={{ "--couleur": couleurDefi(d) }}>
                  <div className="tirage-contenu">
                    {d.id === defiDuMoment?.id && <span className="badge-defi-moment">Défi du moment ⭐</span>}
                    <h3>{d.titre}</h3>
                    {d.description && <p>{d.description}</p>}
                  </div>
                </div>
                <div className="tirage-meta">
                  {objectif && (
                    <span className="defi-difficulte defi-objectif objectif-tirage" style={{ "--couleur": couleurDefi(d) }}>
                      {objectif.nom}
                    </span>
                  )}
                  <IndicateurDifficulte difficulte={d.difficulte} />
                </div>
                {(modifiable || jourPasseAvecTirage) && !jour.fait && !jour.nonReussi && (
                  <button className="btn bouton-choix-tirage" onClick={() => setConfirmation({ type: "choisir", defi: d })}>
                    Choisir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : modifiable ? (
        alerteTirage && difficultesManquantes.length > 0 ? (
          <div className="alerte-tirage" role="alert">
            <p>
              Il manque des défis de difficulté {difficultesManquantes.join(", ")}. Il est conseillé de créer
              au moins un défi de chaque difficulté pour profiter du tirage complet.
            </p>
            {defis.length < 3 && (
              <p>Il faut au moins trois défis distincts pour tirer trois cartes.</p>
            )}
            <div className="actions">
              <button className="btn" onClick={onAllerDefis}>Créer les défis manquants</button>
              <button
                className="btn discret"
                onClick={() => preparerTirage(true)}
                disabled={defis.length < 3}
              >
                Continuer quand même
              </button>
            </div>
          </div>
        ) : (
          <button
            className={`de-bouton${deLance ? " lance" : ""}`}
            onClick={lancerDe}
            disabled={deLance}
            aria-label="Tirer mes défis"
          >
            <span className="de-scene" aria-hidden="true">
              <span className="de-saut">
                <span className="de-tetra">
                  {FACES_DE.flatMap((contenu, i) => [
                    <span key={i} className={`de-triangle t${i}`}><span className="de-face-contenu">{contenu}</span></span>,
                    <span key={`a${i}`} className={`de-triangle t${i} arriere`}><span className="de-face-contenu">{contenu}</span></span>,
                  ])}
                </span>
              </span>
            </span>
            <span className="de-texte">{deLance ? "Tin-tin tinnnn.." : "Tirer mes défis"}</span>
          </button>
        )
      ) : lectureSeule && donneesAnciennesVisibles(selection) ? (
        <p>Pas de défi enregistré pour cette date.</p>
      ) : selection > demain ? (
        <p>Le tirage n’est pas encore possible pour ce jour. Une boule de cristal 🔮 permet de tirer jusqu’à 7 jours à l’avance.</p>
      ) : (
        <p>Aucun défi ce jour-là.</p>
      )}
      {confirmation && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation-defi">
          <div className="tuile">
            {confirmation.type === "choisir" ? (
              <>
                <h2 id="titre-confirmation-defi">Confirmer ton choix</h2>
                <p>Choisir le défi « {confirmation.defi.titre} » pour cette journée ?</p>
              </>
            ) : confirmation.type === "valider" ? (
              <>
                <h2 id="titre-confirmation-defi">Confirmer la réussite</h2>
                <p>As-tu bien réalisé « {defiChoisi?.titre} » aujourd’hui ?</p>
              </>
            ) : confirmation.type === "valider2" ? (
              <>
                <h2 id="titre-confirmation-defi">Deuxième validation 🚀</h2>
                <p>As-tu vraiment réalisé « {defiChoisi?.titre} » une deuxième fois aujourd’hui ? Tu regagneras les cacas et pommes du défi.</p>
              </>
            ) : (
              <>
                <h2 id="titre-confirmation-defi">Confirmer l’échec</h2>
                <p>Confirmer que tu n’as pas réussi « {defiChoisi?.titre} » ? Tu peux ajouter une note pour toi-même.</p>
                <label className="champ-label" htmlFor="note-echec">Note (facultative)</label>
                <textarea
                  id="note-echec"
                  value={noteEchec}
                  onChange={(event) => setNoteEchec(event.target.value)}
                  placeholder="Qu’est-ce qui t’a empêché de réaliser ce défi ?"
                />
              </>
            )}
            {erreurTirage && <p className="attention" role="alert">{erreurTirage}</p>}
            <div className="actions">
              <button className="btn" onClick={confirmerAction}>
                {confirmation.type === "choisir"
                  ? "Confirmer mon choix"
                  : confirmation.type === "valider" || confirmation.type === "valider2"
                    ? "Oui, j’ai réussi"
                    : "Confirmer"}
              </button>
              <button className="btn discret" onClick={() => setConfirmation(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {miroirAffiche && !gain && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-miroir">
          <div className="tuile">
            <h2 id="titre-miroir"><span aria-hidden="true">🪞</span> Un message pour toi</h2>
            <p className="message-miroir">« {miroirAffiche} »</p>
            <button className="btn bouton-fermer-gain" onClick={() => setMiroirAffiche("")}>Merci</button>
          </div>
        </div>
      )}
      {gain && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-gain">
          <div className={`tuile notification-gain ${gain.type === "coeur" ? "gain-coeur" : "gain-cacas"}`}>
            {gain.type === "cacas" ? (
              <>
                <h2 id="titre-gain">+ {gain.montant} caca{gain.montant > 1 ? "s" : ""} 💩</h2>
                {gain.bonus > 0 && (
                  <p className="gain-bonus-hebdo">
                    Engagement hebdomadaire réussi ! Tu as doublé tes gains du défi du moment cette semaine :
                    {" "}+ {gain.bonus} caca{gain.bonus > 1 ? "s" : ""} de bonus 💩
                  </p>
                )}
                <p className="gain-pommes">
                  {gain.pommes > 0
                    ? <>Tu reçois aussi {gain.pommes} pomme{gain.pommes > 1 ? "s" : ""}</>
                    : gain.pommes < 0
                      ? <>Ajustement du solde : {gain.pommes} pomme{gain.pommes < -1 ? "s" : ""}</>
                      : "Aucun ajustement net de pommes"}
                  <span aria-hidden="true">🍎</span>
                </p>
                {gain.objetsGagnes?.length > 0 && (
                  <div className="gain-objets">
                    <strong>Coup de poker ! 🃏</strong>
                    {gain.objetsGagnes.map((objet) => (
                      <p key={objet.id}>
                        {objet.combinaison} : + {objet.nombre} {objet.nom} <span aria-hidden="true">{objet.emoji}</span>
                      </p>
                    ))}
                  </div>
                )}
                <button className="btn bouton-fermer-gain" onClick={() => setGain(null)}>Miam 😋</button>
              </>
            ) : (
              <>
                <h2 id="titre-gain">+ {gain.montant} cœur{gain.montant > 1 ? "s" : ""} ❤️‍🩹</h2>
                <p className="gain-pommes">
                  {gain.pommes > 0
                    ? <>Tu reçois aussi {gain.pommes} pomme{gain.pommes > 1 ? "s" : ""}</>
                    : gain.pommes < 0
                      ? <>Ajustement du solde : {gain.pommes} pomme{gain.pommes < -1 ? "s" : ""}</>
                      : "Aucun ajustement net de pommes"}
                  <span aria-hidden="true">🍎</span>
                </p>
                <button className="btn bouton-fermer-gain" onClick={() => setGain(null)}>I Love myself</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





