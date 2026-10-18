import { DEFIS_DEPART } from "./data/defisDepart";

const PREFIXE = "habibits.";
const ANCIEN_PREFIXE = "CapacitorStorage.";

const CLE_DEFIS = "defis";
const CLE_JOURS = "jours";
const CLE_RAPPEL = "rappel";

function lire(cle) {
  try {
    let valeur = localStorage.getItem(PREFIXE + cle);
    if (valeur === null) {
      // Reprise des données enregistrées avant le passage à la web app seule
      const ancienne = localStorage.getItem(ANCIEN_PREFIXE + cle);
      if (ancienne !== null) {
        localStorage.setItem(PREFIXE + cle, ancienne);
        valeur = ancienne;
      }
    }
    return valeur === null ? null : JSON.parse(valeur);
  } catch {
    return null;
  }
}

function ecrire(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
    // Prévient le reste de l'appli : la sauvegarde automatique écoute ce signal
    window.dispatchEvent(new Event("habibits:donnees-modifiees"));
  } catch {
    // stockage plein ou indisponible : on ignore
  }
}

export async function sauvegarderDefis(defis) {
  ecrire(CLE_DEFIS, defis);
}

export async function chargerDefis() {
  const defis = lire(CLE_DEFIS);
  if (defis) return defis;
  // Premier lancement : on part des défis de départ
  ecrire(CLE_DEFIS, DEFIS_DEPART);
  return DEFIS_DEPART;
}

export async function chargerJours() {
  return lire(CLE_JOURS) || {};
}

export async function sauvegarderJours(jours) {
  ecrire(CLE_JOURS, jours);
}

export async function chargerRappel() {
  return lire(CLE_RAPPEL) || { heure: 20, minute: 0 };
}

export async function sauvegarderRappel(rappel) {
  ecrire(CLE_RAPPEL, rappel);
}
