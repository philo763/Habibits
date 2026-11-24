import { useState } from "react";
import { OBJETS, OBJETS_POKER, decalerJour, diamantsDuJour, objetsUtilisesDuJour, statutObjet } from "./objets";
import { tirerDefis } from "./tirage";

// Logique commune au sac à dos et au calendrier : vérifie, confirme puis applique un objet.
// `cle` : le jour sur lequel on utilise l’objet (aujourd’hui ou un jour à venir encore modifiable).
export function useUtilisationObjet({ cle, estAujourdhui = true, limite = null, defis, jours, inventaire, defiDuMoment = null, onMajJours, onObjetUtilise }) {
  const [message, setMessage] = useState({ id: null, texte: "", reussite: false });
  const [aConfirmer, setAConfirmer] = useState(null);
  const [texteMiroir, setTexteMiroir] = useState("");
  const [choixDiamant, setChoixDiamant] = useState("");

  const demain = decalerJour(cle, 1);
  const quand = estAujourdhui ? "aujourd’hui" : `le ${new Date(cle + "T00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`;
  const jour = jours[cle] || {};
  const defiChoisi = jour.choisi ? defis.find((defi) => defi.id === jour.choisi) || null : null;
  const statutDe = (id) => statutObjet(id, { jours, aujourdhui: cle, limite, inventaire, defiChoisiExiste: Boolean(defiChoisi) });

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

    const patchs = { [cle]: { objetsUtilises: [...objetsUtilisesDuJour(jour), objet.id] } };
    if (objet.id === "diamant") {
      if (!choixDiamant) return;
      patchs[cle] = { diamantsChoisis: [...diamantsDuJour(jour), choixDiamant] };
    }
    if (objet.id === "miroir") {
      if (!texteMiroir.trim()) return;
      patchs[cle].miroirMessage = texteMiroir.trim();
    }
    if (objet.id === "de") {
      const tirage = tirerDefis(defis, defiDuMoment, defis.find((defi) => defi.id === jour.dauphinDefiId) || null);
      if (!tirage) {
        setAConfirmer(null);
        setMessage({ id: objet.id, texte: "Il faut au moins trois défis distincts pour tirer trois cartes.", reussite: false });
        return;
      }
      // Un nouveau tirage est possible : on efface l'ancien, le dé revient et c'est
      // la personne qui relance le tirage.
      patchs[cle].propositions = [];
    } else if (objet.id === "baguette" || objet.id === "lotus") {
      patchs[cle].choisi = null;
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
      onObjetUtilise?.(objet.id);
      setMessage({
        id: objet.id,
        texte: objet.id === "diamant"
          ? "Diamant consommé : ton objet a été ajouté au sac !"
          : objet.id === "de"
            ? `${objet.emoji} ${objet.nom} : le dé est de retour, relance ton tirage !`
            : `${objet.emoji} ${objet.nom} : objet utilisé pour ${quand} !`,
        reussite: true,
      });
    } catch (erreur) {
      setAConfirmer(null);
      setMessage({ id: objet.id, texte: erreur.message, reussite: false });
    }
  }

  const objetAConfirmer = OBJETS.find((element) => element.id === aConfirmer);
  // Le lotus annule le défi du jour : le Chameau et la Fusée déjà utilisés n'auront plus d'effet.
  const objetsPerdusAvecLotus = OBJETS.filter((o) => ["pomme", "fusee"].includes(o.id) && objetsUtilisesDuJour(jour).includes(o.id));
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
        {objetAConfirmer.id === "lotus" && objetsPerdusAvecLotus.length > 0 && (
          <p className="objet-sac-raison">
            Attention : tu as déjà utilisé {objetsPerdusAvecLotus.map((o) => `${o.emoji} ${o.nom}`).join(" et ")} pour {quand}.
            Avec le lotus, il n’y aura pas de défi : {objetsPerdusAvecLotus.length > 1 ? "ces objets seront perdus" : "cet objet sera perdu"}.
          </p>
        )}
        <p>{objetAConfirmer.id === "diamant" ? "Consommer ce diamant ?" : `Utiliser cet objet pour ${quand} ?`}</p>
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

  // « Le dé est de retour » n'a plus de sens une fois le nouveau tirage fait.
  const tirageRefait = message.id === "de" && message.reussite && (jour.propositions || []).length > 0;
  const messageAffiche = tirageRefait ? { id: null, texte: "", reussite: false } : message;

  return { statutDe, utiliser, message: messageAffiche, dialogue };
}
