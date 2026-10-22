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
  const momentIds = new Set(Object.values(jours)
    .filter((jour) => jour?.fait && jour.defiDuMomentIdLorsValidation === jour.choisi)
    .map((jour) => jour.choisi));

  const { collection, defisMoment } = Object.entries(jours).reduce((resultat, [, jour]) => {
    function ajouterCarte(collectionCible, id, defiCopie, objectifCopie) {
      const defiActuel = defis.find((item) => item.id === id);
      const entree = collectionCible.get(id) || {
        nombre: 0,
        defi: defiActuel || defiCopie,
        objectifCopie,
      };
      entree.nombre += 1;
      if (defiActuel) entree.defi = defiActuel;
      if (!entree.objectifCopie && objectifCopie) entree.objectifCopie = objectifCopie;
      collectionCible.set(id, entree);
    }

    if (jour?.fait && jour.choisi) {
      if (jour.defiDuMomentIdLorsValidation === jour.choisi) {
        ajouterCarte(resultat.defisMoment, jour.choisi, jour.defiCopie, jour.objectifCopie);
      } else if (jour.collectionProposable && jour.collectionne) {
        ajouterCarte(
          momentIds.has(jour.choisi) ? resultat.defisMoment : resultat.collection,
          jour.choisi,
          jour.defiCopie,
          jour.objectifCopie
        );
      }
    }
    (Array.isArray(jour?.collectionHistorique) ? jour.collectionHistorique : []).forEach((carte) => {
      if (carte?.id) {
        ajouterCarte(
          momentIds.has(carte.id) ? resultat.defisMoment : resultat.collection,
          carte.id,
          carte.defiCopie,
          carte.objectifCopie
        );
      }
    });
    return resultat;
  }, { collection: new Map(), defisMoment: new Map() });

  const cartes = [...collection.entries()]
    .map(([id, { defi, objectifCopie, nombre }]) => ({
      id,
      defi,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      nombre,
    }))
    .filter(({ defi }) => defi)
    .filter(({ defi }) => difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
    .sort((a, b) => {
      const difference = (Date.parse(b.defi.dateCreation) || 0) - (Date.parse(a.defi.dateCreation) || 0);
      return (triRecent ? 1 : -1) * difference || a.id.localeCompare(b.id);
    });

  const cartesMoment = [...defisMoment.entries()]
    .map(([id, { defi, objectifCopie, nombre }]) => ({
      id,
      defi,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      nombre,
    }))
    .filter(({ defi }) => defi)
    .sort((a, b) => a.id.localeCompare(b.id));

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
      <h2 id="titre-collection" className="jour-titre">Ma collection ({collection.size + defisMoment.size})</h2>
      <div className="comptes-recompenses" aria-label={`Solde : ${recompenses?.solde || 0} cacas`}>
        <span className="compte-recompense">
          <span aria-hidden="true">💩</span>
          <strong>{recompenses?.solde || 0}</strong>
        </span>
      </div>
      <section aria-labelledby="titre-defis-moment-collection">
        <h3 id="titre-defis-moment-collection" className="jour-titre">Défis du moment</h3>
        {progressions.length > 0 && (
          <div className="tuile suivi-bonus-hebdo">
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
          cartesMoment.map(({ id, defi, objectif, nombre }) => (
            <CarteDefiCollection
              key={id}
              defi={defi}
              objectif={objectif}
              nombre={nombre}
              afficherId
            />
          ))
        )}
      </section>

      <section aria-labelledby="titre-cartes-collection">
        <h3 id="titre-cartes-collection" className="jour-titre">Autres cartes ({collection.size})</h3>
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
          <p>{collection.size === 0
            ? "Ta collection est vide. Valide un défi puis ajoute sa carte pour la retrouver ici."
            : "Aucune carte ne correspond aux filtres sélectionnés."}</p>
        ) : (
          cartes.map(({ id, defi, objectif, nombre }) => (
            <CarteDefiCollection
              key={id}
              defi={defi}
              objectif={objectif}
              nombre={nombre}
              afficherId
            />
          ))
        )}
      </section>
    </section>
  );
}
