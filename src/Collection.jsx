import { useState } from "react";
import CarteDefiCollection from "./CarteDefiCollection";

const DIFFICULTES = ["facile", "moyen", "difficile"];
const ORDRE_DIFFICULTE = new Map(DIFFICULTES.map((difficulte, index) => [difficulte, index]));

export default function Collection({ defis, objectifs, jours }) {
  const [tri, setTri] = useState("id");
  const [difficultesFiltrees, setDifficultesFiltrees] = useState([]);
  const comptes = Object.entries(jours).reduce((resultat, [, jour]) => {
    function ajouterCarte(id, defiCopie, objectifCopie) {
      const defiActuel = defis.find((item) => item.id === id);
      const entree = resultat.get(id) || {
        nombre: 0,
        defi: defiActuel || defiCopie,
        objectifCopie,
      };
      entree.nombre += 1;
      if (defiActuel) entree.defi = defiActuel;
      if (!entree.objectifCopie && objectifCopie) entree.objectifCopie = objectifCopie;
      resultat.set(id, entree);
    }

    if (jour?.fait && jour.collectionProposable && jour.collectionne && jour.choisi) {
      ajouterCarte(jour.choisi, jour.defiCopie, jour.objectifCopie);
    }
    (Array.isArray(jour?.collectionHistorique) ? jour.collectionHistorique : []).forEach((carte) => {
      if (carte?.id) ajouterCarte(carte.id, carte.defiCopie, carte.objectifCopie);
    });
    return resultat;
  }, new Map());
  const cartes = [...comptes.entries()]
    .map(([id, { defi, objectifCopie, nombre }]) => ({
      id,
      defi,
      objectif: objectifs.find((item) => item.id === defi?.objectifId) || objectifCopie,
      nombre,
    }))
    .filter(({ defi }) => defi)
    .filter(({ defi }) => difficultesFiltrees.length === 0 || difficultesFiltrees.includes(defi.difficulte))
    .sort((a, b) => {
      if (tri === "recent" || tri === "ancien") {
        const difference = (Date.parse(b.defi.dateCreation) || 0) - (Date.parse(a.defi.dateCreation) || 0);
        return (tri === "recent" ? 1 : -1) * difference || a.id.localeCompare(b.id);
      }
      if (tri === "difficulte") {
        return (ORDRE_DIFFICULTE.get(a.defi.difficulte) ?? 99) -
          (ORDRE_DIFFICULTE.get(b.defi.difficulte) ?? 99) || a.id.localeCompare(b.id);
      }
      return a.id.localeCompare(b.id);
    });

  function basculerDifficulte(difficulte) {
    setDifficultesFiltrees((actives) => actives.includes(difficulte)
      ? actives.filter((niveau) => niveau !== difficulte)
      : [...actives, difficulte]
    );
  }

  return (
    <section aria-labelledby="titre-collection">
      <h2 id="titre-collection" className="jour-titre">Ma collection ({comptes.size})</h2>
      <aside className="panneau-chantier" aria-label="Page en développement">
        <h3>🚧 Page en chantier</h3>
        <p>La collection est encore en développement. Certaines choses peuvent évoluer !</p>
      </aside>
      <div className="filtres-defis filtres-collection" aria-label="Filtrer et trier la collection">
        <div className="filtres-difficulte" aria-label="Filtrer par difficulté">
          {DIFFICULTES.map((niveau) => (
            <button
              key={niveau}
              className={`btn petit filtre-difficulte ${difficultesFiltrees.includes(niveau) ? "actif" : "discret"}`}
              aria-pressed={difficultesFiltrees.includes(niveau)}
              onClick={() => basculerDifficulte(niveau)}
            >
              {niveau[0].toUpperCase() + niveau.slice(1)}
            </button>
          ))}
        </div>
        <div className="filtres-tri" aria-label="Trier la collection">
          {[
            ["id", "ID"],
            ["recent", "Récent"],
            ["ancien", "Ancien"],
            ["difficulte", "Difficulté"],
          ].map(([valeur, libelle]) => (
            <button
              key={valeur}
              className={`btn petit filtre-difficulte ${tri === valeur ? "actif" : "discret"}`}
              aria-pressed={tri === valeur}
              onClick={() => setTri(valeur)}
            >
              {libelle}
            </button>
          ))}
        </div>
      </div>
      {cartes.length === 0 ? (
        <p>{comptes.size === 0
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
  );
}
