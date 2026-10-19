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
          <li>Confirme ton choix et confirme aussi la validation du défi pour éviter les clics involontaires.</li>
          <li>Tu peux valider ou indiquer que tu n’as pas réussi un défi déjà choisi, y compris pour un jour passé.</li>
          <li>Il est impossible de tirer un défi pour un jour passé. Si un tirage existe déjà, tu peux modifier le choix parmi ses cartes après avoir confirmé l’avertissement « Attention, c’est de la triche 😉 ». Une fois le défi validé ou marqué comme non réussi, le choix ne peut plus être modifié.</li>
          <li>Après validation, tu peux ajouter la carte à ta collection. Les défis déjà validés avant cette fonctionnalité n’y sont pas ajoutés automatiquement.</li>
          <li>Si tu n’as pas réussi, signale-le et rédige éventuellement une note à toi-même ; tes notes sont réunies dans la page dédiée.</li>
        </ul>
      </section>
    </article>
  );
}
