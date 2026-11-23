import { useState } from "react";
import { cleDate } from "./dates";
import { OBJETS } from "./objets";
import { useUtilisationObjet } from "./UtilisationObjet";

export default function Objets({ defis, jours, inventaire, defiDuMoment = null, onMajJours }) {
  const [aujourdhui] = useState(() => cleDate(new Date()));
  const [infoOuverte, setInfoOuverte] = useState(null);
  const { statutDe, utiliser, message, dialogue } = useUtilisationObjet({
    aujourdhui, defis, jours, inventaire, defiDuMoment, onMajJours,
  });

  return (
    <ul className="liste-objets-sac">
      {OBJETS.map((objet) => {
        const statut = statutDe(objet.id);
        return (
          <li key={objet.id} className="objet-sac">
            <div className="objet-sac-ligne">
              <span className="objet-sac-emoji" aria-hidden="true">{objet.emoji}</span>
              {objet.avenir && <span className="objet-sac-avenir">À VENIR</span>}
              <strong className="objet-sac-nombre" aria-label={`${objet.nom} : ${inventaire[objet.id]} en stock`}>{inventaire[objet.id]}</strong>
              {!objet.avenir && (
                <button
                  className={`btn petit objet-sac-utiliser ${statut.ok ? "" : "grise"}`}
                  aria-disabled={!statut.ok}
                  onClick={() => utiliser(objet)}
                >
                  Utiliser
                </button>
              )}
              <button
                className="objet-sac-info"
                aria-expanded={infoOuverte === objet.id}
                aria-label={`Informations sur ${objet.nom}`}
                onClick={() => setInfoOuverte(infoOuverte === objet.id ? null : objet.id)}
              >
                ℹ️
              </button>
            </div>
            {infoOuverte === objet.id && <p className="objet-sac-description"><strong>{objet.nom}</strong> : {objet.info}</p>}
            {message.id === objet.id && message.texte && (
              <p className={message.reussite ? "objet-sac-succes" : "objet-sac-raison"} role="status">{message.texte}</p>
            )}
          </li>
        );
      })}
      {dialogue}
    </ul>
  );
}
