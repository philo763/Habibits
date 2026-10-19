export default function Regles() {
  return (
    <article className="page-regles">
      <h2 className="jour-titre">Règles du jeu</h2>
      <div className="tuile regles-resume">
        <p>Tire tes défis, choisis-en un et réalise-le aujourd’hui.</p>
      </div>

      <section aria-labelledby="titre-regles-tirage">
        <h3 id="titre-regles-tirage">Le tirage</h3>
        <ul>
          <li>Un seul tirage par jour, pour aujourd’hui ou demain ; les cartes tirées restent disponibles.</li>
          <li>Le tirage propose un défi facile, un moyen et un difficile.</li>
          <li>
            Un niveau manque ? Crée un défi de ce niveau ou continue : les cartes manquantes sont tirées au hasard
            parmi les défis restants et gardent leur difficulté réelle.
          </li>
          <li>Il faut au moins trois défis distincts pour tirer trois cartes.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-choix">
        <h3 id="titre-regles-choix">Choix et validation</h3>
        <ul>
          <li>Choisis une seule carte pour la journée.</li>
          <li>Valide le défi le jour même ; les jours passés ne sont pas modifiables.</li>
        </ul>
      </section>
    </article>
  );
}
