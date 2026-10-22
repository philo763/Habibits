import { useState } from "react";
import { cleDate, grilleDuMois } from "./dates";
import { couleurObjectif } from "./objectifs";
import { calculerRecompenses, recompensePourDifficulte } from "./recompenses";
import IndicateurDifficulte from "./IndicateurDifficulte";

const NOMS_JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const DIFFICULTES = ["facile", "moyen", "difficile"];

function melanger(liste) {
  const melangee = [...liste];
  for (let i = melangee.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [melangee[i], melangee[j]] = [melangee[j], melangee[i]];
  }
  return melangee;
}

export default function Calendrier({
  defis,
  objectifs = [],
  jours,
  recompenses,
  defiDuMoment = null,
  frequenceHebdoDefiMoment = 3,
  datesTiragesAConfirmer = [],
  lectureSeule = false,
  onMajJour,
  onAllerDefis,
}) {
  const [mois, setMois] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [aujourdhui] = useState(() => cleDate(new Date()));
  const [demain] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return cleDate(date);
  });
  const [selection, setSelection] = useState(aujourdhui);
  const [alerteTirage, setAlerteTirage] = useState(false);
  const [erreurTirage, setErreurTirage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [gain, setGain] = useState(null);
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
    } else if (confirmation.type === "modifier") {
      const collectionHistorique = Array.isArray(jour.collectionHistorique) ? [...jour.collectionHistorique] : [];
      if (jour.collectionne && jour.choisi) {
        collectionHistorique.push({
          id: jour.choisi,
          defiCopie: jour.defiCopie || defiChoisi,
          objectifCopie: jour.objectifCopie || objectifs.find((item) => item.id === defiChoisi?.objectifId) || null,
        });
      }
      if (await maj(selection, {
        choisi: null,
        fait: false,
        nonReussi: false,
        note: "",
        collectionProposable: false,
        collectionne: false,
        defiCopie: null,
        objectifCopie: null,
        collectionHistorique,
      })) {
        setConfirmation(null);
      }
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
      const recompensesAvant = calculerRecompenses(jours);
      const recompensesApres = calculerRecompenses({
        ...jours,
        [selection]: { ...jours[selection], ...patch },
      });
      if (await maj(selection, patch)) {
        setConfirmation(null);
        const montant = recompensesApres.solde - recompensesAvant.solde;
        if (montant > 0) setGain({ type: "cacas", montant });
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
        const montant = recompensesApres.coeurs - recompensesAvant.coeurs;
        if (montant > 0) setGain({ type: "coeur", montant });
      }
    }
  }

  const trouver = (id) => defis.find((d) => d.id === id);
  const donneesAnciennesVisibles = (cle) => datesTiragesAConfirmer.includes(cle);
  const couleurDefi = (defi) =>
    couleurObjectif(objectifs.find((objectif) => objectif.id === defi?.objectifId)?.couleur);
  const cases = grilleDuMois(mois.getFullYear(), mois.getMonth());
  const jour = selection <= demain || donneesAnciennesVisibles(selection) ? jours[selection] || {} : {};
  const defiChoisi = jour.choisi ? trouver(jour.choisi) : null;
  const propositions = (jour.propositions || []).map(trouver).filter(Boolean);
  const modifiable = !lectureSeule && selection >= aujourdhui && selection <= demain;
  const jourPasseAvecTirage = !lectureSeule && selection < aujourdhui &&
    Boolean(jour.choisi || propositions.length > 0);
  const peutModifierChoix = !jour.fait && !jour.nonReussi &&
    (modifiable || (jourPasseAvecTirage && propositions.length > 0));
  const peutModifierEtat = !lectureSeule && selection <= aujourdhui && Boolean(jour.choisi);
  const difficultesManquantes = DIFFICULTES.filter(
    (difficulte) => !defis.some((defi) => defi.difficulte === difficulte)
  );

  function changerMois(delta) {
    setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1));
  }

  function preparerTirage(continuerSansToutesLesDifficultes = false) {
    if (difficultesManquantes.length && !continuerSansToutesLesDifficultes) {
      setAlerteTirage(true);
      setErreurTirage("");
      return;
    }

    setAlerteTirage(false);
    const tirage = DIFFICULTES.flatMap((difficulte) => {
      if (defiDuMoment?.difficulte === difficulte) return [defiDuMoment];
      const defi = melanger(defis.filter((element) => element.difficulte === difficulte))[0];
      return defi ? [defi] : [];
    });
    while (tirage.length < 3) {
      const disponibles = defis.filter((defi) => !tirage.some((selectionne) => selectionne.id === defi.id));
      if (disponibles.length === 0) break;
      tirage.push(melanger(disponibles)[0]);
    }
    if (tirage.length < 3) {
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
          const j = cle <= demain || donneesAnciennesVisibles(cle) ? jours[cle] || {} : {};
          const defi = j.choisi ? trouver(j.choisi) : null;
          let etat = "vide";
          if (j.fait) etat = "fait";
          else if (j.nonReussi) etat = "non-reussi";
          else if (j.choisi) etat = "choisi";
          else if ((j.propositions || []).length) etat = "propose";
          const classes = [
            "case",
            etat,
            cle === selection ? "selection" : "",
            cle === aujourdhui ? "aujourdhui" : "",
            cle < aujourdhui ? "passe" : "",
          ].join(" ");
          return (
            <button key={i} className={classes} onClick={() => {
              setSelection(cle);
              setAlerteTirage(false);
              setErreurTirage("");
            }}>
              <span className="num">{date.getDate()}</span>
              {j.fait && <span className="coche">✔</span>}
              {j.nonReussi && <span className="coche">×</span>}
              <span className="titre-case">{defi ? defi.titre : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="comptes-recompenses" aria-label={`Solde : ${recompenses?.solde || 0} cacas et ${recompenses?.coeurs || 0} cœurs bandés`}>
        <span className="compte-recompense">
          <span aria-hidden="true">💩</span>
          <strong>{recompenses?.solde || 0}</strong>
        </span>
        <span className="compte-recompense">
          <span aria-hidden="true">❤️‍🩹</span>
          <strong>{recompenses?.coeurs || 0}</strong>
        </span>
      </div>

      <h3 className="jour-titre">
        {new Date(selection + "T00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </h3>

      {erreurTirage && <p className="alerte-tirage" role="alert">{erreurTirage}</p>}

      {defiChoisi ? (
        <div className={`tuile ${jour.fait ? "fait" : jour.nonReussi ? "non-reussi" : "c2"}`} style={{ "--couleur": couleurDefi(defiChoisi) }}>
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
              {jour.collectionProposable && !jour.collectionne && !lectureSeule && (
                <button className="btn" onClick={() => maj(selection, { collectionne: true })}>
                  Ajouter ma carte à la collection
                </button>
              )}
              {jour.collectionne && <p>Cette carte est dans ta collection.</p>}
            </>
          )}
          {jour.nonReussi && (
            <>
              <p className="attention">Ce défi n’a pas été réussi.</p>
              {jour.note && <p className="note-personnelle">{jour.note}</p>}
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
                    {d.id === defiDuMoment?.id && <span className="badge-defi-moment">Défi du moment</span>}
                    <h3>{d.titre}</h3>
                    {d.description && <p>{d.description}</p>}
                  </div>
                </div>
                <div className="tirage-meta">
                  {objectif && (
                    <span className="defi-difficulte defi-objectif" style={{ "--couleur": couleurDefi(d) }}>
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
          <button className="btn grand" onClick={() => preparerTirage()}>
            Tirer 3 défis
          </button>
        )
      ) : lectureSeule && donneesAnciennesVisibles(selection) ? (
        <p>Pas de défi enregistré pour cette date.</p>
      ) : selection > demain ? (
        <p>Le tirage est possible uniquement pour aujourd’hui ou demain.</p>
      ) : (
        <p>Aucun défi ce jour-là.</p>
      )}
      {jour.choisi && peutModifierChoix && (
        <div className="actions actions-modifier-choix">
          <button className="btn discret" onClick={() => setConfirmation({ type: "modifier" })}>
            Je me suis trompée
          </button>
        </div>
      )}
      {peutModifierEtat && (jour.fait || jour.nonReussi) && (
        <div className="actions actions-modifier-choix">
          <button
            className="btn petit discret bouton-correction-defi"
            onClick={() => {
              if (jour.fait) {
                setNoteEchec("");
                setConfirmation({ type: "echec" });
              } else {
                setConfirmation({ type: "valider" });
              }
            }}
          >
            Je me suis trompée
          </button>
        </div>
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
            ) : confirmation.type === "modifier" ? (
              <>
                <h2 id="titre-confirmation-defi">Attention, c’est de la triche 😉</h2>
                <p>Tu vas pouvoir revenir au tirage et choisir une autre carte pour cette journée.</p>
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
                  : confirmation.type === "valider"
                    ? "Oui, j’ai réussi"
                    : confirmation.type === "modifier"
                      ? "Oui, je sais…"
                      : "Confirmer"}
              </button>
              <button className="btn discret" onClick={() => setConfirmation(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {gain && (
        <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-gain">
          <div className={`tuile notification-gain ${gain.type === "coeur" ? "gain-coeur" : "gain-cacas"}`}>
            {gain.type === "cacas" ? (
              <>
                <h2 id="titre-gain">+ {gain.montant} caca{gain.montant > 1 ? "s" : ""} 💩</h2>
                <button className="btn" onClick={() => setGain(null)}>Miam 😋</button>
              </>
            ) : (
              <>
                <h2 id="titre-gain">+ {gain.montant} cœur{gain.montant > 1 ? "s" : ""} ❤️‍🩹</h2>
                <button className="btn" onClick={() => setGain(null)}>I Love myself</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}