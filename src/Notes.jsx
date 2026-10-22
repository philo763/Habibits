import { useState } from "react";
import CarteDefiCollection from "./CarteDefiCollection";
import IndicateurDifficulte from "./IndicateurDifficulte";

const DIFFICULTES = ["facile", "moyen", "difficile"];

export default function Notes({ defis, objectifs, jours, recompenses }) {
  const [triRecent, setTriRecent] = useState(true);
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const notes = Object.entries(jours)
    .filter(([, jour]) => jour?.nonReussi && typeof jour.note === "string" && jour.note.trim())
    .map(([date, jour]) => {
      const defi = jour.defiCopie || defis.find((item) => item.id === jour.choisi);
      return {
        date,
        defi,
        objectif: jour.objectifCopie || objectifs.find((item) => item.id === defi?.objectifId),
        note: jour.note.trim(),
      };
    })
    .filter((item) => item.defi)
    .sort((a, b) => (triRecent ? -1 : 1) * a.date.localeCompare(b.date));
  const notesFiltrees = notes.filter(({ defi }) =>
    difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte)
  );

  function basculerDifficulte(difficulte) {
    setDifficultesFiltrees((actives) => actives.includes(difficulte)
      ? actives.filter((niveau) => niveau !== difficulte)
      : [...actives, difficulte]
    );
  }

  return (
    <section aria-labelledby="titre-notes">
      <h2 id="titre-notes" className="jour-titre">Notes à moi-même ({notes.length})</h2>
      <div className="comptes-recompenses" aria-label={`Solde : ${recompenses?.coeurs || 0} cœurs bandés`}>
        <span className="compte-recompense">
          <span aria-hidden="true">❤️‍🩹</span>
          <strong>{recompenses?.coeurs || 0}</strong>
        </span>
      </div>
      {notes.length === 0 ? (
        <p>Tes notes apparaîtront ici si tu choisis d’en écrire après un défi non réussi.</p>
      ) : (
        <>
          <div className="filtres-defis" aria-label="Filtrer et trier les notes">
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
              <div className="filtres-tri" aria-label="Trier les notes par date">
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
          {notesFiltrees.length === 0 ? (
            <p>Aucune note ne correspond aux filtres sélectionnés.</p>
          ) : (
            notesFiltrees.map(({ date, defi, objectif, note }) => (
              <CarteDefiCollection
                key={date}
                defi={defi}
                objectif={objectif}
                note={note}
                date={new Date(`${date}T00:00`).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            ))
          )}
        </>
      )}
    </section>
  );
}
