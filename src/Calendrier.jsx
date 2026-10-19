import { useState, useEffect } from "react";
import { chargerJours, sauvegarderJours } from "./storage";
import { cleDate, grilleDuMois } from "./dates";
import { couleurObjectif } from "./objectifs";
import IndicateurDifficulte from "./IndicateurDifficulte";

const NOMS_JOURS = ["L", "M", "M", "J", "V", "S", "D"];

function melanger(liste) {
  return [...liste].sort(() => Math.random() - 0.5);
}

export default function Calendrier({ defis, objectifs = [] }) {
  const [jours, setJours] = useState({});
  const [mois, setMois] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [aujourdhui] = useState(() => cleDate(new Date()));
  const [selection, setSelection] = useState(aujourdhui);

  useEffect(() => {
    chargerJours().then(setJours);
  }, []);

  async function maj(cle, patch) {
    const nouveau = { ...jours, [cle]: { ...jours[cle], ...patch } };
    setJours(nouveau);
    await sauvegarderJours(nouveau);
  }

  const trouver = (id) => defis.find((d) => d.id === id);
  const couleurDefi = (defi) =>
    couleurObjectif(objectifs.find((objectif) => objectif.id === defi?.objectifId)?.couleur);
  const cases = grilleDuMois(mois.getFullYear(), mois.getMonth());
  const jour = jours[selection] || {};
  const defiChoisi = jour.choisi ? trouver(jour.choisi) : null;
  const propositions = (jour.propositions || []).map(trouver).filter(Boolean);
  const modifiable = selection >= aujourdhui;

  function changerMois(delta) {
    setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1));
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
          const j = jours[cle] || {};
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
            <button key={i} className={classes} onClick={() => setSelection(cle)}>
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

      {defiChoisi ? (
        <div className={`tuile ${jour.fait ? "fait" : "c2"}`} style={{ "--couleur": couleurDefi(defiChoisi) }}>
          <h3>{defiChoisi.titre}</h3>
          <p>{defiChoisi.description}</p>
          {selection === aujourdhui && !jour.fait && (
            <button className="btn" onClick={() => maj(selection, { fait: true })}>Valider le défi ✔</button>
          )}
          {jour.fait && <p className="accompli">Défi accompli !</p>}
        </div>
      ) : modifiable ? (
        propositions.length === 0 ? (
          <button
            className="btn grand"
            onClick={() => maj(selection, { propositions: melanger(defis).slice(0, 3).map((d) => d.id) })}
          >
            Tirer 3 défis
          </button>
        ) : (
          <div className="tirage-defis">
            {propositions.map((d, i) => {
              const objectif = objectifs.find((element) => element.id === d.objectifId);
              return (
                <div key={d.id} className="tirage-colonne">
                  <div className="tirage-indicateur">
                    <IndicateurDifficulte difficulte={d.difficulte} />
                  </div>
                  <div className={`tuile c${i} carte-tirage`} style={{ "--couleur": couleurDefi(d) }}>
                    <div className="tirage-badges">
                      {objectif && (
                        <span className="defi-difficulte defi-objectif" style={{ "--couleur": couleurDefi(d) }}>
                          {objectif.nom}
                        </span>
                      )}
                    </div>
                    <div className="tirage-contenu">
                      <h3>{d.titre}</h3>
                      {d.description && <p>{d.description}</p>}
                      <button className="btn" onClick={() => maj(selection, { choisi: d.id })}>Choisir</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <p>Aucun défi ce jour-là.</p>
      )}
    </div>
  );
}