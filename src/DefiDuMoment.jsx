import { useState } from "react";
import { cleDate } from "./dates";
import { debutSemaine } from "./recompenses";
import CarteDefiCollection from "./CarteDefiCollection";

const formaterDate = (date) => date.toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function DefiDuMoment({
  defis,
  objectifs,
  recompenses,
  gestionDefis,
  modifierGestionDefis,
  erreurGestionDefis,
}) {
  const [semaineActuelle] = useState(() => debutSemaine(cleDate(new Date())));
  const debut = new Date(`${semaineActuelle}T00:00:00`);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 6);

  const defiChoisi = defis.find((defi) => defi.id === gestionDefis?.defiDuMomentId);
  const objectifDefi = defiChoisi && objectifs.find((objectif) => objectif.id === defiChoisi.objectifId);
  const suivi = (recompenses?.suivisHebdomadaires || [])
    .find((item) => item.semaine === semaineActuelle && item.defiId === defiChoisi?.id);
  const nombre = suivi?.nombre || 0;
  const total = suivi?.objectif || gestionDefis?.frequencesHebdo?.[defiChoisi?.id] || 3;

  return (
    <section aria-labelledby="titre-defi-moment">
      <h2 id="titre-defi-moment" className="jour-titre titre-defis-moment-collection">⭐ Défi du moment</h2>
      {defiChoisi && gestionDefis.defiDuMomentActif ? (
        <>
          <div className="defi-moment-suivi">
            <div className="defi-moment-carte">
              <CarteDefiCollection defi={defiChoisi} objectif={objectifDefi} />
            </div>
            <div className="defi-moment-compteur" aria-label={`${nombre} réussite sur ${total} cette semaine`}>
              {nombre}/{total}
            </div>
          </div>
          <p className="jour-titre description-mes-defis">
            Du <span>{formaterDate(debut)}</span> au <span>{formaterDate(fin)}</span>
          </p>
        </>
      ) : (
        <p>Aucun défi du moment actif.</p>
      )}
      <div className="tuile panneau-defi-moment">
        <hr className="separateur-section" />
        <label className="case-a-cocher case-defi-moment">
          <input
            type="checkbox"
            checked={gestionDefis.defiDuMomentActif}
            disabled={!gestionDefis.defiDuMomentId}
            onChange={(event) => modifierGestionDefis({ defiDuMomentActif: event.target.checked })}
          />
          Activer le défi du moment
        </label>
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
          </>
        )}
        {erreurGestionDefis &&  <p className="attention" role="alert">{erreurGestionDefis}</p>}
        {!defis.length && <p className="note">Crée d’abord un défi dans « Objectifs & défis ».</p>}
        <hr className="separateur-section" />
        <details className="explications-defi-moment">
          <summary>Règles</summary>
          <p>
            Choisis un défi qui apparaîtra à chaque tirage tant que l’option est activée. Il remplacera la carte
            aléatoire de sa difficulté : le tirage conservera trois cartes.
          </p>
          {gestionDefis.defiDuMomentId && (
            <p>
              Une fois cet objectif atteint entre lundi et dimanche, tu reçois en bonus autant de cacas que ce défi
              t’en a rapportés cette semaine. Le seuil est fixé à la première validation du défi chaque semaine ;
              si tu le changes ensuite, le nouveau seuil s’appliquera la semaine suivante.
            </p>
          )}
        </details>
      </div>
    </section>
  );
}
