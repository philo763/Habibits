import { useState } from "react";
import { cleDate } from "./dates";
import { debutSemaine } from "./recompenses";
import CarteDefiCollection from "./CarteDefiCollection";
import IndicateurDifficulte from "./IndicateurDifficulte";

const DIFFICULTES = ["facile", "moyen", "difficile"];

export default function Collection({ defis, objectifs, jours, recompenses, gestionDefis }) {
  const [triRecent, setTriRecent] = useState(true);
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const [semaineActuelle] = useState(() => debutSemaine(cleDate(new Date())));

  const { collection, defisMoment } = Object.entries(jours).reduce((resultat, [date, jour]) => {
    function ajouterCarte(collectionCible, id, defiCopie, objectifCopie, cle) {
      const defiActuel = defis.find((item) => item.id === id);
      const entree = {
        cle,
        date,
        id,
        defi: defiActuel || defiCopie,
        objectifCopie,
      };
      collectionCible.push(entree);
    }

    if (jour?.fait && jour.choisi) {
      if (jour.defiDuMomentIdLorsValidation === jour.choisi) {
        ajouterCarte(resultat.defisMoment, jour.choisi, jour.defiCopie, jour.objectifCopie, `${date}:moment`);
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

  const cartes = collection
    .map(({ id, defi, objectifCopie, date, cle }) => ({
      cle,
      id,
      defi,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      date,
    }))
    .filter(({ defi }) => defi)
    .filter(({ defi }) => difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
    .sort((a, b) => {
      return (triRecent ? -1 : 1) * a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
    });

  const cartesMoment = defisMoment
    .map(({ id, defi, objectifCopie, date, cle }) => ({
      cle,
      id,
      defi,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      date,
    }))
    .filter(({ defi }) => defi)
    .sort((a, b) => a.date.localeCompare(b.date));

  const suivisSemaine = (recompenses?.suivisHebdomadaires || [])
    .filter((suivi) => suivi.semaine === semaineActuelle);
  const defiMomentActif = defis.find((defi) =>
    defi.id === gestionDefis?.defiDuMomentId && gestionDefis.defiDuMomentActif
  );
  const suiviActif = defiMomentActif && !suivisSemaine.some((suivi) => suivi.defiId === defiMomentActif.id)
    ? {
      defiId: defiMomentActif.id,
      nombre: 0,
      objectif: gestionDefis.frequencesHebdo?.[defiMomentActif.id] || 3,
      recompenses: 0,
      bonus: 0,
    }
    : null;
  const progressions = suiviActif ? [...suivisSemaine, suiviActif] : suivisSemaine;

  function basculerDifficulte(difficulte) {
    setDifficultesFiltrees((actives) => actives.includes(difficulte)
      ? actives.filter((niveau) => niveau !== difficulte)
      : [...actives, difficulte]
    );
  }

  return (
    <section aria-labelledby="titre-collection">
      <h2 id="titre-collection" className="jour-titre">Ma collection ({collection.length + defisMoment.length})</h2>
      <div
        className="comptes-recompenses total-gagne-collection"
        aria-label={`Total gagné depuis le début : ${recompenses?.totalGagne || 0} cacas`}
      >
        <span className="compte-recompense">
          <span aria-hidden="true">💩</span>
          <strong>{recompenses?.totalGagne || 0}</strong>
          <span className="libelle-total-gagne">gagnés depuis le début</span>
        </span>
      </div>
      <section aria-labelledby="titre-defis-moment-collection">
        <h3 id="titre-defis-moment-collection" className="jour-titre titre-defis-moment-collection">Défis du moment</h3>
        {progressions.length > 0 && (
          <div className="tuile suivi-bonus-hebdo suivi-defi-moment">
            <h3>Objectif de la semaine</h3>
            {progressions.map((suivi) => {
              const defi = defis.find((item) => item.id === suivi.defiId) ||
                defisMoment.get(suivi.defiId)?.defi;
              return (
                <p key={suivi.defiId}>
                  {defi?.titre || "Défi du moment"} : {suivi.nombre}/{suivi.objectif} cette semaine.
                  {suivi.bonus > 0
                    ? ` Bonus gagné : 💩 ${suivi.bonus}.`
                    : ` Bonus prévu : 💩 ${suivi.recompenses} si l’objectif est atteint.`}
                </p>
              );
            })}
          </div>
        )}
        {cartesMoment.length === 0 ? (
          <p>Les défis du moment réussis apparaîtront ici.</p>
        ) : (
          cartesMoment.map(({ cle, defi, objectif, date }) => (
            <CarteDefiCollection
              key={cle}
              defi={defi}
              objectif={objectif}
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

      <section aria-labelledby="titre-cartes-collection">
        <h3 id="titre-cartes-collection" className="jour-titre">Autres cartes ({collection.length})</h3>
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
          <p>          {collection.length === 0
            ? "Ta collection est vide. Valide un défi puis ajoute sa carte pour la retrouver ici."
            : "Aucune carte ne correspond aux filtres sélectionnés."}</p>
        ) : (
          cartes.map(({ cle, defi, objectif, date }) => (
            <CarteDefiCollection
              key={cle}
              defi={defi}
              objectif={objectif}
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
