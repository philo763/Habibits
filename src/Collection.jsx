import { useEffect, useState } from "react";
import CarteDefiCollection from "./CarteDefiCollection";
import IndicateurDifficulte from "./IndicateurDifficulte";
import { cartesCollection } from "./cartesCollection";
import { couleurObjectif } from "./objectifs";

const DIFFICULTES = ["facile", "moyen", "difficile"];

const formaterDate = (date) => new Date(`${date}T00:00`).toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Collection({ defis, objectifs, jours }) {
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const [carteOuverte, setCarteOuverte] = useState(null);

  const toutes = cartesCollection(defis, jours).map((carte) => ({
    ...carte,
    objectif: objectifs.find((item) => item.id === carte.defi.objectifId) || carte.objectifCopie,
  }));
  const obtenues = toutes.filter((carte) => carte.exemplaires.length > 0).length;
  const cartes = toutes.filter(({ defi }) =>
    difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte));
  const ouverte = carteOuverte && toutes.find((carte) => carte.id === carteOuverte);

  useEffect(() => {
    if (!ouverte) return undefined;
    const fermerAvecEchap = (event) => {
      if (event.key === "Escape") setCarteOuverte(null);
    };
    window.addEventListener("keydown", fermerAvecEchap);
    return () => window.removeEventListener("keydown", fermerAvecEchap);
  }, [ouverte]);

  function basculerDifficulte(difficulte) {
    setDifficultesFiltrees((actives) => actives.includes(difficulte)
      ? actives.filter((niveau) => niveau !== difficulte)
      : [...actives, difficulte]
    );
  }

  return (
    <section aria-labelledby="titre-collection">
      <h2 id="titre-collection" className="jour-titre">
        Ma collection ({obtenues}/{toutes.length})
      </h2>
      <div className="filtres-defis" aria-label="Filtrer la collection">
        <div className="filtres-difficulte" aria-label="Filtrer par difficulté">
          {DIFFICULTES.map((niveau) => (
            <button
              key={niveau}
              className={`btn petit filtre-difficulte ${difficultesFiltrees.includes(niveau) ? "actif" : "discret"}`}
              aria-pressed={difficultesFiltrees.includes(niveau)}
              onClick={() => basculerDifficulte(niveau)}
            >
              {niveau[0].toUpperCase() + niveau.slice(1)}
              <IndicateurDifficulte difficulte={niveau} decoratif />
            </button>
          ))}
        </div>
      </div>
      {cartes.length === 0 ? (
        <p>{toutes.length === 0
          ? "Ta collection est vide. Crée des défis dans « Mes objectifs » pour avoir des cartes à gagner."
          : "Aucune carte ne correspond aux filtres sélectionnés."}</p>
      ) : (
        <ul className="grille-collection">
          {cartes.map(({ id, defi, objectif, exemplaires, supprime }) => (
            <li key={id} className="case-collection">
              {exemplaires.length > 0 ? (
                <button
                  className={`carte-mini ${supprime ? "carte-bloquee" : ""}`}
                  style={{ "--couleur": couleurObjectif(objectif?.couleur) }}
                  onClick={() => setCarteOuverte(id)}
                  aria-label={`Carte n° ${defi.numero} : ${defi.titre}${supprime ? " (défi supprimé)" : ""}, ${exemplaires.length} exemplaire${exemplaires.length > 1 ? "s" : ""}`}
                >
                  <span className="carte-mini-haut">
                    <span className="carte-mini-numero">#{defi.numero}</span>
                    <IndicateurDifficulte difficulte={defi.difficulte} decoratif />
                  </span>
                  <span className="carte-mini-titre">{defi.titre}</span>
                  {objectif && <span className="carte-mini-objectif">{objectif.nom}</span>}
                  {supprime && <span className="carte-mini-cadenas" aria-hidden="true">🔒</span>}
                </button>
              ) : (
                <div className="carte-mini carte-manquante" aria-label={`Carte n° ${defi.numero} pas encore obtenue`}>
                  <span className="carte-manquante-numero" aria-hidden="true">#{defi.numero}</span>
                </div>
              )}
              {/* Toujours présent (vide pour 0 ou 1 exemplaire) : toutes les cartes d'une ligne gardent la même hauteur */}
              <span className="carte-mini-exemplaires" aria-hidden="true">
                {exemplaires.length > 1 ? `× ${exemplaires.length}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {ouverte && (
        <div
          className="completion-defi"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-carte-ouverte"
          onClick={(event) => {
            if (event.target === event.currentTarget) setCarteOuverte(null);
          }}
        >
          <div className="tuile detail-carte-collection">
            <h2 id="titre-carte-ouverte" className="sr-only">Carte n° {ouverte.defi.numero}</h2>
            <div className={ouverte.supprime ? "carte-bloquee" : ""}>
              <CarteDefiCollection defi={ouverte.defi} objectif={ouverte.objectif} numero={ouverte.defi.numero} />
            </div>
            {ouverte.supprime && <p className="detail-carte-supprime">🔒 Ce défi a été supprimé.</p>}
            <h3 className="detail-carte-titre-dates">
              {ouverte.exemplaires.length > 1 ? `Gagnée ${ouverte.exemplaires.length} fois` : "Gagnée 1 fois"}
            </h3>
            <ul className="detail-carte-dates">
              {ouverte.exemplaires.map(({ date, moment }, index) => (
                <li key={`${date}:${index}`}>
                  {formaterDate(date)}
                  {moment && <span className="detail-carte-etoile" role="img" aria-label="défi du moment"> ⭐</span>}
                </li>
              ))}
            </ul>
            <button className="btn" onClick={() => setCarteOuverte(null)}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  );
}
