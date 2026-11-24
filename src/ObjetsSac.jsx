import { Fragment, useState } from "react";
import { OBJETS } from "./objets";

// Page « Objets » du sac à dos : on y consulte ses objets ; on les utilise depuis le calendrier.
export default function ObjetsSac({ inventaire, recompenses, onAller }) {
  const [infoOuverte, setInfoOuverte] = useState(null);
  const objetsPoker = OBJETS.filter((objet) => !objet.avenir);
  const objetsAVenir = OBJETS.filter((objet) => objet.avenir);
  const coeurs = recompenses?.coeurs || 0;
  const pommes = recompenses?.pommes || 0;

  return (
    <div className="sac">
      <div className="sac-recompenses">
        <button className="sac-recompense" onClick={() => onAller("notes")} aria-label={`${coeurs} cœurs bandés : aller dans mes notes`}>
          <span className="sac-recompense-emoji" aria-hidden="true">❤️‍🩹</span>
          <strong>{coeurs}</strong>
          <small>Mes notes ›</small>
        </button>
        <button className="sac-recompense" onClick={() => onAller("shop")} aria-label={`${pommes} popommes : aller au shop`}>
          <span className="sac-recompense-emoji" aria-hidden="true">🍎</span>
          <strong>{pommes}</strong>
          <small>Le shop ›</small>
        </button>
      </div>

      <hr className="sac-separation" />

      <ul className="sac-grille">
        {objetsPoker.map((objet, index) => {
          const nombre = inventaire[objet.id] || 0;
          const ouvert = infoOuverte === objet.id;
          // L'explication s'affiche en pleine largeur, à la fin de la rangée (2 cartes) de l'objet ouvert.
          const objetOuvert = objetsPoker.find((element) => element.id === infoOuverte);
          const indexOuvert = objetsPoker.indexOf(objetOuvert);
          const finDeRangee = index === Math.min(indexOuvert - (indexOuvert % 2) + 1, objetsPoker.length - 1);
          return (
            <Fragment key={objet.id}>
            <li className={`sac-objet ${nombre === 0 ? "vide" : ""} ${ouvert ? "ouvert" : ""}`}>
              <button
                className="sac-objet-carte"
                aria-expanded={ouvert}
                aria-label={`${objet.nom} : ${nombre} en stock. Afficher l’explication`}
                onClick={() => setInfoOuverte(ouvert ? null : objet.id)}
              >
                <span className="sac-objet-emoji" aria-hidden="true">{objet.emoji}</span>
                <span className="sac-objet-nombre" aria-hidden="true">×{nombre}</span>
                <strong className="sac-objet-nom">{objet.nom}</strong>
              </button>
            </li>
            {objetOuvert && finDeRangee && (
              <li className="sac-objet-info">
                <strong>{objetOuvert.emoji} {objetOuvert.nom}</strong>
                <small className="sac-objet-combinaison">
                  Gagné avec : {objetOuvert.combinaison}
                  <button
                    className="sac-objet-regles"
                    aria-label="Voir les règles des coups de poker"
                    onClick={() => onAller("regles", "poker")}
                  >
                    ℹ️
                  </button>
                </small>
                <span>{objetOuvert.info}</span>
              </li>
            )}
            </Fragment>
          );
        })}
      </ul>

      <p className="sac-astuce">Tous les objets s’utilisent depuis le calendrier.</p>

      {objetsAVenir.length > 0 && (
        <>
          <h3 className="sac-sous-titre">Bientôt</h3>
          <ul className="sac-avenir">
            {objetsAVenir.map((objet) => (
              <li key={objet.id}>
                <span className="sac-avenir-emoji" aria-hidden="true">{objet.emoji}</span>
                <span><strong>{objet.nom}</strong> : {objet.info}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
