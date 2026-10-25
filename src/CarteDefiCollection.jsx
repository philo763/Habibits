import { couleurObjectif } from "./objectifs";
import IndicateurDifficulte from "./IndicateurDifficulte";

export default function CarteDefiCollection({ defi, objectif, note, date }) {
  const couleur = couleurObjectif(objectif?.couleur);

  return (
    <article className="tuile defi-tuile carte-collection" style={{ "--couleur": couleur }}>
      <div className="defi-corps">
        <div className="defi-contenu">
          <div className="carte-collection-entete">
            <h3>{defi.titre}</h3>
          </div>
          {defi.description && <p>{defi.description}</p>}
          {objectif && (
            <span className="defi-difficulte defi-objectif carte-collection-objectif" style={{ "--couleur": couleur }}>
              {objectif.nom}
            </span>
          )}
        </div>
        <div className="defi-actions">
          <span className="defi-difficulte" aria-label={`Difficulté ${defi.difficulte}`} title={`Difficulté ${defi.difficulte}`}>
            <IndicateurDifficulte difficulte={defi.difficulte} />
          </span>
        </div>
      </div>
      {date && <p className="note-date">{date}</p>}
      {note && <p className="note-personnelle">{note}</p>}
    </article>
  );
}
