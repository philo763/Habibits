import { useState } from "react";
import CarteDefiCollection from "./CarteDefiCollection";
import IndicateurDifficulte from "./IndicateurDifficulte";

const DIFFICULTES = ["facile", "moyen", "difficile"];

export default function Collection({ defis, objectifs, jours }) {
  const [triRecent, setTriRecent] = useState(true);
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);

  const { collection, defisMoment } = Object.entries(jours).reduce((resultat, [date, jour]) => {
    function ajouterCarte(collectionCible, id, defiCopie, objectifCopie, cle, moment = false) {
      const defiActuel = defis.find((item) => item.id === id);
      const entree = {
        cle,
        date,
        id,
        defi: defiActuel || defiCopie,
        objectifCopie,
        moment,
      };
      collectionCible.push(entree);
    }

    if (jour?.fait && jour.choisi) {
      if (jour.defiDuMomentIdLorsValidation === jour.choisi) {
        ajouterCarte(resultat.defisMoment, jour.choisi, jour.defiCopie, jour.objectifCopie, `${date}:moment`, true);
      } else if (jour.collectionne) {
        ajouterCarte(
          resultat.collection,
          jour.choisi,
          jour.defiCopie,
          jour.objectifCopie,
          `${date}:collection`
        );
      }
    }
    (Array.isArray(jour?.collectionHistorique) ? jour.collectionHistorique : []).forEach((carte, index) => {
      if (carte?.id) {
        ajouterCarte(
          resultat.collection,
          carte.id,
          carte.defiCopie,
          carte.objectifCopie,
          `${date}:historique:${index}`
        );
      }
    });
    return resultat;
  }, { collection: [], defisMoment: [] });

  const total = collection.length + defisMoment.length;
  const cartes = [...collection, ...defisMoment]
    .map(({ id, defi, objectifCopie, date, cle, moment }) => ({
      cle,
      id,
      defi,
      moment,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      date,
    }))
    .filter(({ defi }) => defi)
    .filter(({ defi }) => difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
    .sort((a, b) => {
      return (triRecent ? -1 : 1) * a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
    });

  function basculerDifficulte(difficulte) {
    setDifficultesFiltrees((actives) => actives.includes(difficulte)
      ? actives.filter((niveau) => niveau !== difficulte)
      : [...actives, difficulte]
    );
  }

  return (
    <section aria-labelledby="titre-collection">
      <h2 id="titre-collection" className="jour-titre">Ma collection ({total})</h2>
      <section aria-labelledby="titre-collection">
        <div className="filtres-defis" aria-label="Filtrer et trier la collection">
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
            <div className="filtres-tri" aria-label="Trier la collection par date">
              <button
                className={`btn petit filtre-difficulte ${triRecent ? "actif" : "discret"}`}
                onClick={() => setTriRecent(true)}
                aria-pressed={triRecent}
              >
                Récent
              </button>
              <button
                className={`btn petit filtre-difficulte ${!triRecent ? "actif" : "discret"}`}
                onClick={() => setTriRecent(false)}
                aria-pressed={!triRecent}
              >
                Ancien
              </button>
            </div>
          </div>
        </div>
        {cartes.length === 0 ? (
          <p>          {total === 0
            ? "Ta collection est vide. Valide un défi puis ajoute sa carte pour la retrouver ici."
            : "Aucune carte ne correspond aux filtres sélectionnés."}</p>
        ) : (
          cartes.map(({ cle, defi, objectif, date, moment }) => (
            <CarteDefiCollection
              key={cle}
              defi={defi}
              objectif={objectif}
              moment={moment}
              date={new Date(`${date}T00:00`).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          ))
        )}
      </section>
    </section>
  );
}
