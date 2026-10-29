export default function Regles() {
  return (
    <article className="page-regles">
      <h2 className="jour-titre">Règles du jeu</h2>
      <div className="tuile regles-resume">
        <p className="resume-regles-texte">Tire tes défis, choisis-en un et réalise-le aujourd’hui.</p>
      </div>

      <section aria-labelledby="titre-regles-tirage">
        <h3 id="titre-regles-tirage">Le tirage quotidien</h3>
        <ul>
          <li>Un seul tirage par jour, pour aujourd'hui ou demain. Le reste des cartes reste disponible pour d'autres tirages.</li>
          <li>Choisis un défi facile, moyen ou difficile.</li>
          <li>S'il est activé, le défi du moment remplace le défi aléatoire de sa difficulté à chaque tirage.</li>
          <li>Chaque défi réussi rapporte des cacas : 1 pour un défi facile, 3 pour un moyen et 5 pour un difficile. Chaque défi non réussi rapporte un cœur bandé ❤️‍🩹. Confirme chaque gain avec le bouton affiché ; le calendrier et la Collection affichent le total de cacas gagnés depuis le début, tandis que le solde de popommes est visible uniquement dans Le Shop.</li>
          <li>Les défis du moment réussis apparaissent dans leur section dédiée de la collection. Atteindre l’objectif hebdomadaire choisi donne un bonus égal aux cacas rapportés par ce défi dans la semaine, du lundi au dimanche.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-choix">
        <h3 id="titre-regles-choix">Choix et validation</h3>
        <ul>
          <li>Choisis une seule carte pour la journée.</li>
          <li>Si un tirage existe déjà, tu peux modifier le choix parmi ses cartes après avoir confirmé l’avertissement « Attention, c’est de la triche 😉 ». Une fois le défi validé ou marqué comme non réussi, le choix ne peut plus être modifié.</li>
          <li>Tu peux valider ou indiquer que tu n’as pas réussi un défi déjà choisi, y compris pour un jour passé.</li>
          <li>Il est impossible de tirer un défi pour un jour passé. Si un tirage existe déjà, modifie le choix après confirmation.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-recompenses">
        <h3 id="titre-regles-recompenses">Récompense caca et coeur bandé</h3>
        <ul>
          <li>Chaque défi réussi rapporte des cacas 💩 : 1 pour facile, 3 pour moyen et 5 pour difficile ; chaque caca gagné rapporte aussi une pomme 🍎.</li>
          <li>Un cœur bandé ❤️‍🩹 est obtenu si un défi n'est pas réussi et rapporte aussi une pomme 🍎. Confirme chaque gain avec le bouton affiché.</li>
          <li>Si tu n’as pas réussi, signale-le et rédige éventuellement une note à toi-même ; tes notes sont réunies dans la page dédiée.</li>
          <li>Les défis du moment réussis apparaissent dans leur section dédiée de la collection. Atteindre l’objectif hebdomadaire du défi du moment donne un bonus égal aux cacas rapportés par ce défi dans la semaine.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-bibit">
        <h3 id="titre-regles-bibit">Mon Bibit et Le Shop</h3>
        <ul>
          <li>Le look de base de ton Bibit est inclus. Les couleurs et les yeux (dans la catégorie Corps) coûtent 5 et 10 pommes ; les accessoires coûtent 15 pommes. Les habits, dans la section Habibits, arrivent plus tard. Le Shop est accessible depuis Mon Bibit.</li>
          <li>Chaque article disponible ne peut être acheté qu’une fois ; l’achat est définitif et une confirmation affiche le prix en pommes et le solde restant.</li>
          <li>Un achat débloque l’article sans l’équiper automatiquement. Dans Mon Bibit, tu peux choisir une option par catégorie et les combiner ; les articles débloqués restent disponibles pour toujours. Les anciens articles déjà achetés restent dans ton dressing même s’ils ne sont plus proposés au Shop.</li>
          <li>Le Shop affiche Mes popommes, le solde disponible après les achats. Le calendrier et la Collection affichent les cacas et les cœurs gagnés ; ces récompenses ne sont jamais dépensées. Une pomme est accordée par caca gagné et par cœur bandé gagné.</li>
          <li>Les récompenses obtenues avant ce changement sont aussi converties en pommes : une pomme par caca et par cœur bandé, moins les achats déjà effectués. Si une validation est corrigée, le solde de pommes est recalculé et peut devenir négatif ; les gains suivants le feront remonter.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-choix">
        <h3 id="titre-regles-choix">Collectionne tes défis réussis</h3>
        <ul>
          <li>Après validation de ton défi, tu peux ajouter la carte défi à ta collection.</li>
          <li>⚠️ Les défis déjà validés avant cette fonctionnalité n’y sont pas ajoutés automatiquement.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-regles-manque-niveau">
        <h3 id="titre-regles-manque-niveau">Cartes manquantes ?</h3>
        <ul>
          <li>
            Un niveau manque ? Crée un défi de ce niveau ou continue : les cartes manquantes sont tirées au hasard
            parmi les défis restants et gardent leur difficulté réelle.
          </li>
          <li>Il faut au moins trois défis distincts pour tirer trois cartes.</li>
        </ul>
      </section>

    </article>
  );
}
