import { useState } from "react";
import { OBJETS, OBJETS_POKER, decalerJour, diamantsDuJour, objetsUtilisesDuJour, statutObjet } from "./objets";
import { tirerDefis } from "./tirage";

// Logique commune au sac à dos et au calendrier : vérifie, confirme puis applique un objet.
export function useUtilisationObjet({ aujourdhui, defis, jours, inventaire, defiDuMoment = null, onMajJours }) {
  const [message, setMessage] = useState({ id: null, texte: "", reussite: false });
  const [aConfirmer, setAConfirmer] = useState(null);
  const [texteMiroir, setTexteMiroir] = useState("");
  const [choixDiamant, setChoixDiamant] = useState("");

  const demain = decalerJour(aujourdhui, 1);
  const jour = jours[aujourdhui] || {};
  const defiChoisi = jour.choisi ? defis.find((defi) => defi.id === jour.choisi) || null : null;
  const statutDe = (id) => statutObjet(id, { jours, aujourdhui, inventaire, defiChoisiExiste: Boolean(defiChoisi) });

  async function utiliser(objet) {
    const statut = statutDe(objet.id);
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

    const patchs = { [aujourdhui]: { objetsUtilises: [...objetsUtilisesDuJour(jour), objet.id] } };
    if (objet.id === "diamant") {
      if (!choixDiamant) return;
      patchs[aujourdhui] = { diamantsChoisis: [...diamantsDuJour(jour), choixDiamant] };
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
        texte: objet.id === "diamant" ? "Diamant consommé : ton objet a été ajouté au sac !" : `${objet.emoji} ${objet.nom} : objet utilisé pour aujourd’hui !`,
        reussite: true,
      });
    } catch (erreur) {
      setAConfirmer(null);
      setMessage({ id: objet.id, texte: erreur.message, reussite: false });
    }
  }

  const objetAConfirmer = OBJETS.find((element) => element.id === aConfirmer);
  const dialogue = objetAConfirmer ? (
    <div className="completion-defi" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation-objet">
      <div className="tuile">
        <h2 id="titre-confirmation-objet"><span aria-hidden="true">{objetAConfirmer.emoji}</span> {objetAConfirmer.nom}</h2>
        <p>{objetAConfirmer.info}</p>
        {objetAConfirmer.id === "diamant" && (
          <select value={choixDiamant} onChange={(event) => setChoixDiamant(event.target.value)} aria-label="Objet à obtenir">
            <option value="">Choisis un objet…</option>
            {OBJETS.filter((o) => OBJETS_POKER.includes(o.id)).map((o) => (
              <option key={o.id} value={o.id}>{o.emoji} {o.nom}</option>
            ))}
          </select>
        )}
        {objetAConfirmer.id === "miroir" && (
          <textarea
            value={texteMiroir}
            onChange={(event) => setTexteMiroir(event.target.value)}
            placeholder="Ton message pour les jours difficiles…"
            aria-label="Message du miroir"
          />
        )}
        <p>{objetAConfirmer.id === "diamant" ? "Consommer ce diamant ?" : "Utiliser cet objet aujourd’hui ?"}</p>
        <div className="actions">
          <button
            className="btn"
            disabled={(objetAConfirmer.id === "miroir" && !texteMiroir.trim()) || (objetAConfirmer.id === "diamant" && !choixDiamant)}
            onClick={() => utiliser(objetAConfirmer)}
          >
            Confirmer
          </button>
          <button className="btn discret" onClick={() => setAConfirmer(null)}>Annuler</button>
        </div>
      </div>
    </div>
  ) : null;

  return { statutDe, utiliser, message, dialogue };
}
