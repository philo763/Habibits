import { useState } from "react";
import { cleDate, grilleDuMois } from "./dates";
import { couleurObjectif } from "./objectifs";
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

  async function maj(cle, patch) {
    try {
      await onMajJour(cle, patch);
      setErreurTirage("");
    } catch (erreur) {
      setErreurTirage(erreur.message);
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
              <span className="titre-case">{defi ? defi.titre : ""}</span>
            </button>
          );
        })}
      </div>

      <h3 className="jour-titre">
        {new Date(selection + "T00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </h3>

      {erreurTirage && <p className="alerte-tirage" role="alert">{erreurTirage}</p>}

      {defiChoisi ? (
        <div className={`tuile ${jour.fait ? "fait" : "c2"}`} style={{ "--couleur": couleurDefi(defiChoisi) }}>
          <h3>{defiChoisi.titre}</h3>
          <p>{defiChoisi.description}</p>
          {selection === aujourdhui && !jour.fait && !lectureSeule && (
            <button className="btn" onClick={() => maj(selection, { fait: true })}>Valider le défi ✔</button>
          )}
          {jour.fait && <p className="accompli">Défi accompli !</p>}
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
                {!lectureSeule && (
                  <button className="btn bouton-choix-tirage" onClick={() => maj(selection, { choisi: d.id })}>
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
    </div>
  );
}