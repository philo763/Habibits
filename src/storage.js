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

export async function chargerDefis() {
  const defis = lire(CLE_DEFIS);
  if (defis) {
    const maintenant = new Date().toISOString();
    let migre = false;
    const defisMigres = defis.map((defi) => {
      const dateCreationValide =
        typeof defi.dateCreation === "string" && Number.isFinite(Date.parse(defi.dateCreation));
      if (dateCreationValide) return defi;
      migre = true;
      return { ...defi, dateCreation: maintenant };
    });
    if (migre) await sauvegarderDefis(defisMigres);
    return defisMigres;
  }
  // Premier lancement : on part des défis de départ
  const defisInitiaux = DEFIS_DEPART.map((defi) => ({ ...defi, dateCreation: new Date().toISOString() }));
  await sauvegarderDefis(defisInitiaux);
  return defisInitiaux;
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
