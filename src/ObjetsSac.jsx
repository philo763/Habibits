import { useState } from "react";
import { cleDate } from "./dates";
import { OBJETS, OBJETS_POKER, decalerJour, statutObjet } from "./objets";
import { tirerDefis } from "./tirage";

export default function Objets({ defis, jours, inventaire, defiDuMoment = null, onMajJours }) {
  const [aujourdhui] = useState(() => cleDate(new Date()));
  const [infoOuverte, setInfoOuverte] = useState(null);
  const [message, setMessage] = useState({ id: null, texte: "", reussite: false });
  const [aConfirmer, setAConfirmer] = useState(null);
  const [texteMiroir, setTexteMiroir] = useState("");
  const [choixDiamant, setChoixDiamant] = useState("");

  const demain = decalerJour(aujourdhui, 1);
  const jour = jours[aujourdhui] || {};
  const defiChoisi = jour.choisi ? defis.find((defi) => defi.id === jour.choisi) || null : null;

  async function utiliser(objet) {
    const statut = statutObjet(objet.id, { jours, aujourdhui, inventaire, defiChoisiExiste: Boolean(defiChoisi) });
    if (!statut.ok) {
      setAConfirmer(null);
      setMessage({ id: objet.id, texte: statut.raison, reussite: false });
      return;
    }
    if (aConfirmer !== objet.id) {
      setAConfirmer(objet.id);
      setMessage({ id: null, texte: "", reussite: false });
      return;
    }

    const patchs = { [aujourdhui]: { objetUtilise: objet.id } };
    if (objet.id === "diamant") {
      if (!choixDiamant) return;
      patchs[aujourdhui] = { diamantChoix: choixDiamant };
    }
    if (objet.id === "miroir") {
      if (!texteMiroir.trim()) return;
      patchs[aujourdhui].miroirMessage = texteMiroir.trim();
    }
    if (objet.id === "de") {
      const tirage = tirerDefis(defis, defiDuMoment, defis.find((defi) => defi.id === jour.dauphinDefiId) || null);
      if (!tirage) {
        setAConfirmer(null);
        setMessage({ id: objet.id, texte: "Il faut au moins trois défis distincts pour tirer trois cartes.", reussite: false });
        return;
      }
      patchs[aujourdhui].propositions = tirage.map((defi) => defi.id);
    } else if (objet.id === "baguette" || objet.id === "lotus") {
      patchs[aujourdhui].choisi = null;
    } else if (objet.id === "dauphin") {
      const propositionsDemain = Array.isArray(jours[demain]?.propositions) ? jours[demain].propositions : [];
      const patchDemain = { dauphinDefiId: defiChoisi.id };
      if (propositionsDemain.length > 0) {
        const aGarder = propositionsDemain.filter((id) => {
          const defi = defis.find((element) => element.id === id);
          return id !== defiChoisi.id && defi?.difficulte !== defiChoisi.difficulte;
        });
        patchDemain.propositions = [defiChoisi.id, ...aGarder];
      }
      patchs[demain] = patchDemain;
    }

    try {
      await onMajJours(patchs);
      setAConfirmer(null);
      setTexteMiroir("");
      setChoixDiamant("");
      setMessage({
        id: objet.id,
        texte: objet.id === "diamant" ? "Diamant consommé : ton objet a été ajouté au sac !" : `${objet.nom} utilisé pour aujourd’hui !`,
        reussite: true,
      });
    } catch (erreur) {
      setAConfirmer(null);
      setMessage({ id: objet.id, texte: erreur.message, reussite: false });
    }
  }

  return (
    <ul className="liste-objets-sac">
      {OBJETS.map((objet) => {
        const statut = statutObjet(objet.id, { jours, aujourdhui, inventaire, defiChoisiExiste: Boolean(defiChoisi) });
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
      {aConfirmer && (() => {
        const objet = OBJETS.find((element) => element.id === aConfirmer);
        return (
          <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation-objet">
            <div className="tuile">
              <h2 id="titre-confirmation-objet"><span aria-hidden="true">{objet.emoji}</span> {objet.nom}</h2>
              <p>{objet.info}</p>
              {objet.id === "diamant" && (
                <select value={choixDiamant} onChange={(event) => setChoixDiamant(event.target.value)} aria-label="Objet à obtenir">
                  <option value="">Choisis un objet…</option>
                  {OBJETS.filter((o) => OBJETS_POKER.includes(o.id)).map((o) => (
                    <option key={o.id} value={o.id}>{o.emoji} {o.nom}</option>
                  ))}
                </select>
              )}
              {objet.id === "miroir" && (
                <textarea
                  value={texteMiroir}
                  onChange={(event) => setTexteMiroir(event.target.value)}
                  placeholder="Ton message pour les jours difficiles…"
                  aria-label="Message du miroir"
                />
              )}
              <p>{objet.id === "diamant" ? "Consommer ce diamant ?" : "Utiliser cet objet aujourd’hui ? Tu ne pourras plus en utiliser d’autre aujourd’hui."}</p>
              <div className="actions">
                <button className="btn" disabled={(objet.id === "miroir" && !texteMiroir.trim()) || (objet.id === "diamant" && !choixDiamant)} onClick={() => utiliser(objet)}>Confirmer</button>
                <button className="btn discret" onClick={() => setAConfirmer(null)}>Annuler</button>
              </div>
            </div>
          </div>
        );
      })()}
    </ul>
  );
}
