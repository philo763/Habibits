import CarteDefiCollection from "./CarteDefiCollection";

export default function Notes({ defis, objectifs, jours }) {
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
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section aria-labelledby="titre-notes">
      <h2 id="titre-notes" className="jour-titre">Notes à moi-même ({notes.length})</h2>
      <aside className="panneau-chantier" aria-label="Page en développement">
        <h3>🚧 Page en chantier</h3>
        <p>Les notes à moi-même sont encore en développement. Certaines choses peuvent évoluer !</p>
      </aside>
      {notes.length === 0 ? (
        <p>Tes notes apparaîtront ici si tu choisis d’en écrire après un défi non réussi.</p>
      ) : (
        notes.map(({ date, defi, objectif, note }) => (
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
    </section>
  );
}
