import { useState } from "react";
import { OBJETS } from "./objets";
import { useUtilisationObjet } from "./UtilisationObjet";

// Sous la date du jour : une rangée d'icônes des objets utilisables maintenant.
// Un clic sur une icône ouvre son détail juste en dessous.
export default function ObjetsDuJour(props) {
  const { inventaire, onAllerObjets } = props;
  const [ouvertId, setOuvertId] = useState(null);
  // Une fois l'objet utilisé, son détail se referme.
  const { statutDe, utiliser, message, dialogue } = useUtilisationObjet({ ...props, onObjetUtilise: () => setOuvertId(null) });
  const disponibles = OBJETS.filter((objet) => statutDe(objet.id).ok);
  const ouvert = disponibles.find((objet) => objet.id === ouvertId);

  if (!disponibles.length && !message.texte) return null;

  return (
    <section className="objets-jour" aria-label="Objets utilisables ce jour-là">
      {disponibles.length > 0 && (
        <div className="objets-jour-rangee">
          {disponibles.map((objet) => (
            <button
              key={objet.id}
              className={`objets-jour-icone${ouvertId === objet.id ? " ouvert" : ""}`}
              aria-expanded={ouvertId === objet.id}
              aria-label={`${objet.nom} : ${inventaire[objet.id]} en stock`}
              onClick={() => setOuvertId(ouvertId === objet.id ? null : objet.id)}
            >
              <span aria-hidden="true">{objet.emoji}</span>
              <small aria-hidden="true">{inventaire[objet.id]}</small>
            </button>
          ))}
        </div>
      )}
      {ouvert && (
        <div className="objets-jour-detail">
          <strong>{ouvert.emoji} {ouvert.nom}</strong>
          <p>{ouvert.info}</p>
          <div className="objets-jour-action">
            <small>Il t’en restera {inventaire[ouvert.id] - 1}</small>
            {onAllerObjets && (
              <button className="objets-jour-sac" aria-label="Voir mes objets dans le sac à dos" onClick={onAllerObjets}>
                <span aria-hidden="true">🎒</span>
              </button>
            )}
            <button className="btn petit objets-jour-utiliser" aria-label={`Utiliser ${ouvert.nom}`} onClick={() => utiliser(ouvert)}>
              Utiliser
            </button>
          </div>
        </div>
      )}
      {message.texte && (
        <p className={message.reussite ? "objet-sac-succes" : "objet-sac-raison"} role="status">{message.texte}</p>
      )}
      {dialogue}
    </section>
  );
}
