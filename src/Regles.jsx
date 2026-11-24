import { useEffect, useRef } from "react";
import CaseCalendrier from "./CaseCalendrier";
import { couleurObjectif } from "./objectifs";

// Couleurs d'exemple pour les cases des règles (une couleur = un objectif)
const V = couleurObjectif("violet");
const T = couleurObjectif("turquoise");
const R = couleurObjectif("rose");
const DIFFICULTE = { F: "facile", M: "moyen", D: "difficile" };

const COUPS = [
  { nom: "Paire", definition: "2 défis de même difficulté", objet: "🪩 boule disco (×1 facile, ×2 moyen, ×3 difficile)", cartes: [["F", V], ["F", T]] },
  { nom: "Double paire", definition: "deux paires", objet: "🐫 chameau", cartes: [["F", V], ["F", T], ["M", R], ["M", V]] },
  { nom: "Brelan", definition: "3 défis de même difficulté", objet: "🪄 baguette magique", cartes: [["M", R], ["M", V], ["M", T]] },
  { nom: "Suite", definition: "facile + moyen + difficile", objet: "🪷 lotus", cartes: [["F", T], ["M", V], ["D", R]] },
  { nom: "Couleur", definition: "5 défis du même objectif", objet: "🐬 dauphin", cartes: [["F", T], ["D", T], ["M", T], ["F", T], ["D", T]] },
  { nom: "Full", definition: "brelan + paire", objet: "🔮 boule de cristal", cartes: [["D", V], ["D", T], ["D", R], ["F", T], ["F", V]] },
  { nom: "Carré", definition: "4 défis de même difficulté", objet: "🚀 fusée", cartes: [["F", V], ["F", T], ["F", R], ["F", V]] },
  { nom: "Suite couleur", definition: "facile + moyen + difficile du même objectif", objet: "💎 diamant (objet au choix)", cartes: [["F", R], ["M", R], ["D", R]] },
];

// Une carte : [difficulté, couleur] ; "rate" pour un défi raté, "lotus" pour un jour de repos.
function estCarte(carte) {
  return Array.isArray(carte);
}

// Une suite de cases d'exemple, en ligne ou en colonne, reliées par des portes entre deux jours réussis.
function CasesExemple({ cartes, vertical = false }) {
  return (
    <span className={`regles-cases ${vertical ? "verticales" : ""}`} aria-hidden="true">
      {cartes.map((carte, i) => {
        const avant = estCarte(cartes[i - 1]);
        const apres = estCarte(cartes[i + 1]);
        if (carte === "rate") return <CaseCalendrier key={i} element="span" etat="non-reussi" className="sans-numero" />;
        if (carte === "lotus") return <CaseCalendrier key={i} element="span" lotus className="sans-numero" />;
        const [valeur, couleur] = carte;
        return (
          <CaseCalendrier
            key={i}
            element="span"
            etat="fait"
            couleur={couleur}
            difficulte={DIFFICULTE[valeur]}
            className="sans-numero"
            portes={vertical ? { haut: avant, bas: apres } : { gauche: avant, droite: apres }}
          />
        );
      })}
    </span>
  );
}

export default function Regles({ sectionOuverte = null }) {
  const refPoker = useRef(null);
  useEffect(() => {
    if (sectionOuverte === "poker") refPoker.current?.scrollIntoView({ block: "start" });
  }, [sectionOuverte]);

  return (
    <article className="page-regles">
      <h2 className="jour-titre">Règles du jeu</h2>
      <div className="tuile regles-resume">
        <p className="resume-regles-texte">Tire tes défis, choisis-en un et réalise-le aujourd’hui.</p>
      </div>

      <details className="regles-section">
        <summary><h3>Récompenses</h3></summary>
        <ul>
          <li>Chaque défi réussi rapporte des cacas 💩 : 1 pour facile, 3 pour moyen et 5 pour difficile ; chaque caca gagné rapporte aussi une popomme 🍎.</li>
          <li>Un cœur bandé ❤️‍🩹 est obtenu si un défi n'est pas réussi et rapporte aussi une popomme 🍎.</li>
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

      <details className="regles-section" ref={refPoker} open={sectionOuverte === "poker" || undefined}>
        <summary><h3>Coups de poker</h3></summary>
        <ul>
          <li>Chaque défi réussi est une carte : sa <strong>valeur</strong> est sa difficulté (barres) et sa <strong>couleur</strong> est son objectif.</li>
          <li>Les cartes qui se suivent forment des mains, <strong>en ligne</strong> (dans la semaine) comme <strong>en colonne</strong> (le même jour de la semaine, d’une semaine à l’autre). Une carte compte dans sa ligne et dans sa colonne.</li>
          <li>Une main reste dans le mois : elle repart à zéro au changement de mois, et chaque semaine aussi pour les lignes.</li>
          <li>Un défi raté ou un jour sans défi réussi casse la série. Un jour de repos 🪷 est neutre : il ne casse rien.</li>
          <li>Chaque main te donne un objet dès qu’elle est atteinte. Tu peux les utiliser aujourd’hui ou sur un jour à venir du calendrier (en touchant sa case), et plusieurs le même jour, mais le chameau, la fusée, le lotus, la boule de cristal et le dauphin ne servent qu’une fois par jour.</li>
        </ul>
        <ul className="regles-poker">
          {COUPS.map((coup) => (
            <li key={coup.nom}>
              <span className="regles-main">
                <CasesExemple cartes={coup.cartes} />
                <small className="regles-main-definition">{coup.definition}</small>
              </span>
              <span><strong>{coup.nom}</strong> → {coup.objet}</span>
            </li>
          ))}
        </ul>

        <h4 className="regles-exemples-titre">Exemples</h4>
        <ul className="regles-poker regles-exemples">
          <li>
            <CasesExemple cartes={[["F", V], ["M", T], ["D", R]]} vertical />
            <span><strong>En colonne</strong> : trois lundis de suite (facile, moyen, difficile) → Suite 🪷.</span>
          </li>
          <li>
            <CasesExemple cartes={[["F", V], ["F", T], "rate", ["M", R], ["M", V]]} />
            <span><strong>Le raté casse la série</strong> : deux paires séparées → 2 boules disco 🪩, mais pas de double paire.</span>
          </li>
          <li>
            <CasesExemple cartes={[["D", T], "lotus", ["D", R]]} />
            <span><strong>Le repos ne casse rien</strong> : paire de difficiles → 🪩 ×3.</span>
          </li>
        </ul>
      </details>

    </article>
  );
}
