const C = "♥";
const P = "♠";
const K = "♦";
const T = "♣";
const COUPS = [
  { nom: "Paire", objet: "🪩 boule disco (×1 facile, ×2 moyen, ×3 difficile)", cartes: [["F", C], ["F", P]] },
  { nom: "Double paire", objet: "🐫 chameau", cartes: [["F", C], ["F", P], ["M", K], ["M", T]] },
  { nom: "Brelan", objet: "🐬 dauphin", cartes: [["M", K], ["M", C], ["M", T]] },
  { nom: "Suite", objet: "🪷 lotus", cartes: [["F", P], ["M", C], ["D", K]] },
  { nom: "Couleur", objet: "🪄 baguette magique", cartes: [["F", T], ["D", T], ["M", T], ["F", T], ["D", T]] },
  { nom: "Full", objet: "🔮 boule de cristal", cartes: [["D", C], ["D", P], ["D", K], ["F", T], ["F", C]] },
  { nom: "Carré", objet: "🚀 fusée", cartes: [["F", C], ["F", P], ["F", K], ["F", T]] },
  { nom: "Suite couleur", objet: "💎 diamant (objet au choix)", cartes: [["F", C], ["M", C], ["D", C]] },
];

export default function Regles() {
  return (
    <article className="page-regles">
      <h2 className="jour-titre">Règles du jeu</h2>
      <div className="tuile regles-resume">
        <p className="resume-regles-texte">Tire tes défis, choisis-en un et réalise-le aujourd’hui.</p>
      </div>

      <details className="regles-section">
        <summary><h3>Récompenses</h3></summary>
        <ul>
          <li>Chaque défi réussi rapporte des cacas 💩 : 1 pour facile, 3 pour moyen et 5 pour difficile ; chaque caca gagné rapporte aussi une pomme 🍎.</li>
          <li>Un cœur bandé ❤️‍🩹 est obtenu si un défi n'est pas réussi et rapporte aussi une pomme 🍎.</li>
          <li>Si tu n’as pas réussi, signale-le et rédige éventuellement une note à toi-même ; tes notes sont réunies dans la page dédiée.</li>
        </ul>
      </details>

      <details className="regles-section">
        <summary><h3>Défi du moment</h3></summary>
        <ul>
          <li>Les défis du moment réussis apparaissent dans leur section dédiée de la collection. Atteindre l’objectif hebdomadaire du défi du moment donne un bonus égal aux cacas rapportés par ce défi dans la semaine.</li>
        </ul>
      </details>

      <details className="regles-section">
        <summary><h3>Collectionne tes défis réussis</h3></summary>
        <ul>
          <li>Après validation de ton défi, tu peux ajouter la carte défi à ta collection.</li>
        </ul>
      </details>

      <details className="regles-section">
        <summary><h3>Coups de poker</h3></summary>
        <ul>
          <li>Chaque défi réussi est une carte : sa <strong>valeur</strong> est sa difficulté (F facile, M moyen, D difficile) et sa <strong>couleur</strong> est sa catégorie.</li>
          <li>Les cartes de la semaine (lundi–dimanche) forment des mains. Chaque main te donne un objet dès qu’elle est atteinte, et tout repart à zéro à la fin de la semaine.</li>
          <li>Un jour de repos 🪷 est neutre. Un seul objet utilisable par jour.</li>
        </ul>
        <ul className="regles-poker">
          {COUPS.map((coup) => (
            <li key={coup.nom}>
              <span className="cartes-mini" aria-hidden="true">
                {coup.cartes.map(([valeur, symbole], i) => (
                  <span key={i} className={`carte-mini ${symbole === C || symbole === K ? "rouge" : ""}`}>
                    <small>{valeur}</small>{symbole}
                  </span>
                ))}
              </span>
              <span><strong>{coup.nom}</strong> → {coup.objet}</span>
            </li>
          ))}
        </ul>
        <p className="regles-poker-note">Double paire : deux paires. Suite : facile + moyen + difficile. Couleur : 5 défis de la même catégorie. Full : brelan + paire. Suite couleur : facile + moyen + difficile de la même catégorie. Fusée : après la validation, un bouton 🚀 permet de valider le défi une 2ème fois.</p>
      </details>

    </article>
  );
}
