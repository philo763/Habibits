import { DEFIS_DEPART } from "./data/defisDepart";
import { normaliserDonneesDefis } from "./objectifs";

const PREFIXE = "habibits.";
const ANCIEN_PREFIXE = "CapacitorStorage.";

const CLE_DEFIS = "defis";
const CLE_OBJECTIFS = "objectifs";
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
    return true;
  } catch {
    return false;
  }
}

export async function sauvegarderDefis(defis) {
  if (!ecrire(CLE_DEFIS, defis)) {
    throw new Error("Les défis n'ont pas pu être enregistrés dans le stockage local.");
  }
}

export async function sauvegarderObjectifs(objectifs) {
  if (!ecrire(CLE_OBJECTIFS, objectifs)) {
    throw new Error("Les objectifs n'ont pas pu être enregistrés dans le stockage local.");
  }
}

export async function chargerDonneesDefis() {
  const donneeStockee = lire(CLE_DEFIS);
  const defisBruts = Array.isArray(donneeStockee)
    ? donneeStockee
    : DEFIS_DEPART.map((defi) => ({ ...defi, dateCreation: new Date().toISOString() }));
  const objectifsBruts = lire(CLE_OBJECTIFS);
  const { defis, objectifs } = normaliserDonneesDefis(defisBruts, objectifsBruts);
  if (JSON.stringify(objectifsBruts) !== JSON.stringify(objectifs)) await sauvegarderObjectifs(objectifs);
  if (JSON.stringify(donneeStockee) !== JSON.stringify(defis)) await sauvegarderDefis(defis);
  return { defis, objectifs };
}

export async function chargerDefis() {
  return (await chargerDonneesDefis()).defis;
}

export async function chargerObjectifs() {
  return (await chargerDonneesDefis()).objectifs;
}

export async function chargerJours() {
  return lire(CLE_JOURS) || {};
}

export async function sauvegarderJours(jours) {
  if (!ecrire(CLE_JOURS, jours)) {
    throw new Error("Les données du calendrier n'ont pas pu être enregistrées dans le stockage local.");
  }
}

export async function chargerRappel() {
  return lire(CLE_RAPPEL) || { heure: 20, minute: 0 };
}

export async function sauvegarderRappel(rappel) {
  ecrire(CLE_RAPPEL, rappel);
}
