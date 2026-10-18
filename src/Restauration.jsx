import { useState } from "react";
import {
  useSauvegarde,
  choisirFichierARestaurer,
  lireFichierChoisi,
  confirmerRestauration,
  formaterDateHeure,
} from "./sauvegarde";

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;

export default function Restauration({ onFermer }) {
  const s = useSauvegarde();
  const [choix, setChoix] = useState(null);
  const [erreur, setErreur] = useState("");
  const [continuer, setContinuer] = useState(true);
  const [occupe, setOccupe] = useState(false);

  function recevoir(resultat) {
    if (resultat.annule) return;
    if (!resultat.ok) {
      setChoix(null);
      setErreur(resultat.erreur);
      return;
    }
    setErreur("");
    setChoix(resultat);
  }

  async function choisir() {
    recevoir(await choisirFichierARestaurer());
  }

  async function surFichier(evenement) {
    const fichier = evenement.target.files && evenement.target.files[0];
    evenement.target.value = "";
    if (fichier) recevoir(await lireFichierChoisi(fichier));
  }

  async function confirmer() {
    setOccupe(true);
    try {
      await confirmerRestauration(choix, { continuerDansCeFichier: continuer && Boolean(choix.handle) });
      window.location.reload();
    } catch {
      setOccupe(false);
      setErreur("La restauration n'a pas marché. Tes données actuelles n'ont pas été touchées.");
      setChoix(null);
    }
  }

  if (!choix) {
    return (
      <div className="restauration">
        <p>Choisis ton fichier de sauvegarde Habibits (il se termine par .json).</p>
        {erreur && <p className="attention">{erreur}</p>}
        <div className="actions">
          {s.supporte ? (
            <button className="btn" onClick={choisir}>
              Choisir un fichier
            </button>
          ) : (
            <label className="btn" style={{ display: "inline-block", textAlign: "center" }}>
              Choisir un fichier
              <input type="file" accept=".json,application/json" onChange={surFichier} style={{ display: "none" }} />
            </label>
          )}
          <button className="btn discret" onClick={onFermer}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  const r = choix.resume;
  return (
    <div className="restauration">
      <p>
        <strong>{choix.nom}</strong>
      </p>
      <ul className="liste-infos">
        {r.exporteLe && <li>Enregistré le {formaterDateHeure(r.exporteLe)}</li>}
        <li>{pluriel(r.nbDefis, "défi")}</li>
        <li>{pluriel(r.nbValides, "jour validé")}</li>
      </ul>
      <p className="attention">
        ⚠ Ça remplace les défis et l'historique de ce téléphone. Tu pourras annuler dans Paramètres.
      </p>
      {choix.handle && (
        <label className="case-a-cocher">
          <input type="checkbox" checked={continuer} onChange={(e) => setContinuer(e.target.checked)} />
          Continuer à sauvegarder automatiquement dans ce fichier
        </label>
      )}
      <div className="actions">
        <button className="btn" onClick={confirmer} disabled={occupe}>
          Remplacer mes données
        </button>
        <button className="btn discret" onClick={() => setChoix(null)} disabled={occupe}>
          Choisir un autre fichier
        </button>
      </div>
    </div>
  );
}
