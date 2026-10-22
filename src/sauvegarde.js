// ---------------------------------------------------------------------------
// Sauvegarde des données
//  - sauvegarde automatique dans un fichier choisi par l'utilisateur
//    (API d'accès aux fichiers : Chrome, Edge, Samsung Internet)
//  - export (menu de partage ou téléchargement) et restauration
//  - demande de stockage persistant (anti-nettoyage automatique)
// ---------------------------------------------------------------------------
import { useSyncExternalStore } from "react";
import {
  chargerJours,
  chargerRappel,
  sauvegarderDefis,
  sauvegarderObjectifs,
  chargerDonneesDefis,
  sauvegarderJours,
  sauvegarderRappel,
  chargerGestionDefis,
  sauvegarderGestionDefis,
} from "./storage";
import { cleDate } from "./dates";
import { normaliserDonneesDefis } from "./objectifs";

const APP = "habibits";
const VERSION_FORMAT = 2;

const CLE_META = "habibits.sauvegarde";
const CLE_ACCUEIL = "habibits.accueil";
const CLE_AVANT_IMPORT = "habibits.avant-import";
const CLE_LIEN_FICHIER = "fichier-sauvegarde";

const OPTIONS_FICHIER = {
  types: [{ description: "Sauvegarde Habibits", accept: { "application/json": [".json"] } }],
};

// ---------- Petits réglages (hors données : ils ne font pas partie de la sauvegarde) ----------

function lireLocal(cle) {
  try {
    return JSON.parse(localStorage.getItem(cle)) || {};
  } catch {
    return {};
  }
}

function ecrireLocal(cle, patch) {
  try {
    localStorage.setItem(cle, JSON.stringify({ ...lireLocal(cle), ...patch }));
  } catch {
    // stockage indisponible : on ignore
  }
}

export const lireAccueil = () => lireLocal(CLE_ACCUEIL);
export const ecrireAccueil = (patch) => ecrireLocal(CLE_ACCUEIL, patch);

// ---------- Petit coffre IndexedDB : il garde le lien vers le fichier de sauvegarde ----------

function ouvrirBase() {
  return new Promise((resolve, reject) => {
    const demande = indexedDB.open("habibits-sauvegarde", 1);
    demande.onupgradeneeded = () => demande.result.createObjectStore("coffre");
    demande.onsuccess = () => resolve(demande.result);
    demande.onerror = () => reject(demande.error);
  });
}

async function coffre(mode, action) {
  const base = await ouvrirBase();
  return new Promise((resolve, reject) => {
    const transaction = base.transaction("coffre", mode);
    const demande = action(transaction.objectStore("coffre"));
    transaction.oncomplete = () => {
      base.close();
      resolve(demande.result);
    };
    transaction.onerror = () => {
      base.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      base.close();
      reject(transaction.error);
    };
  });
}

const lireCoffre = (cle) => coffre("readonly", (magasin) => magasin.get(cle));
const ecrireCoffre = (cle, valeur) => coffre("readwrite", (magasin) => magasin.put(valeur, cle));
const effacerCoffre = (cle) => coffre("readwrite", (magasin) => magasin.delete(cle));

// ---------- État partagé avec l'interface ----------
// statut : "inactive" | "ok" | "reconnecter" | "introuvable" | "erreur" | "conflit"
// persistant : "inconnu" | "accorde" | "non" | "indisponible"

const meta0 = lireLocal(CLE_META);

let etat = {
  supporte: "showSaveFilePicker" in window && "showOpenFilePicker" in window,
  statut: "inactive",
  nom: null,
  derniere: meta0.derniereAuto || null,
  dernierExport: meta0.dernierExport || null,
  persistant: "inconnu",
  conflit: null,
};

const ecouteurs = new Set();

function maj(patch) {
  etat = { ...etat, ...patch };
  ecouteurs.forEach((f) => f());
}

function abonner(f) {
  ecouteurs.add(f);
  return () => ecouteurs.delete(f);
}

export function useSauvegarde() {
  return useSyncExternalStore(abonner, () => etat);
}

// ---------- Format du fichier ----------

async function construireSauvegarde() {
  return {
    app: APP,
    version: VERSION_FORMAT,
    exporteLe: new Date().toISOString(),
    donnees: {
      ...await chargerDonneesDefis(),
      jours: await chargerJours(),
      rappel: await chargerRappel(),
      gestionDefis: await chargerGestionDefis(),
    },
  };
}

function compterValides(jours) {
  return Object.values(jours || {}).filter((j) => j && j.fait).length;
}

function verifierSauvegarde(texte) {
  let objet;
  try {
    objet = JSON.parse(texte);
  } catch {
    return { ok: false, erreur: "Ce fichier n'est pas lisible. Choisis un fichier de sauvegarde Habibits (.json)." };
  }
  if (!objet || objet.app !== APP) {
    return { ok: false, erreur: "Ce fichier ne vient pas d'Habibits." };
  }
  if (typeof objet.version !== "number" || objet.version > VERSION_FORMAT) {
    return { ok: false, erreur: "Ce fichier vient d'une version plus récente d'Habibits. Mets l'appli à jour, puis réessaie." };
  }
  const d = objet.donnees;
  const defisOk =
    Array.isArray(d?.defis) && d.defis.every((x) => x && typeof x.id === "string" && typeof x.titre === "string");
  const objectifsOk =
    d?.objectifs === undefined ||
    (Array.isArray(d.objectifs) &&
      d.objectifs.every((x) => x && typeof x.id === "string" && typeof x.nom === "string"));
  const joursOk = d?.jours && typeof d.jours === "object" && !Array.isArray(d.jours);
  const rappelOk = d?.rappel && Number.isInteger(d.rappel.heure) && Number.isInteger(d.rappel.minute);
  const gestionDefisOk = d?.gestionDefis === undefined ||
    (d.gestionDefis && typeof d.gestionDefis.defiDuMomentId === "string" &&
      typeof d.gestionDefis.defiDuMomentActif === "boolean" &&
      (d.gestionDefis.frequencesHebdo === undefined ||
        (d.gestionDefis.frequencesHebdo && typeof d.gestionDefis.frequencesHebdo === "object" &&
          !Array.isArray(d.gestionDefis.frequencesHebdo) &&
          Object.values(d.gestionDefis.frequencesHebdo).every((frequence) =>
            Number.isInteger(frequence) && frequence >= 1 && frequence <= 7))));
  if (!defisOk || !objectifsOk || !joursOk || !rappelOk || !gestionDefisOk) {
    return { ok: false, erreur: "Le contenu du fichier est incomplet ou abîmé. Essaie une autre sauvegarde." };
  }
  const donneesNormalisees = normaliserDonneesDefis(d.defis, d.objectifs);
  return {
    ok: true,
    sauvegarde: {
      ...objet,
      version: VERSION_FORMAT,
      donnees: {
        ...d,
        ...donneesNormalisees,
        gestionDefis: {
          defiDuMomentId: d.gestionDefis?.defiDuMomentId || "",
          defiDuMomentActif: Boolean(d.gestionDefis?.defiDuMomentId) &&
            d.gestionDefis?.defiDuMomentActif === true,
          frequencesHebdo: d.gestionDefis?.frequencesHebdo || {},
        },
      },
    },
    resume: {
      nbDefis: d.defis.length,
      nbValides: compterValides(d.jours),
      exporteLe: objet.exporteLe,
    },
  };
}

// Remplace les données de l'appli (en gardant une copie pour pouvoir annuler)
async function appliquerSauvegarde(sauvegarde) {
  try {
    const actuel = await construireSauvegarde();
    localStorage.setItem(CLE_AVANT_IMPORT, JSON.stringify(actuel));
  } catch {
    // pas de copie de secours possible : on continue
  }
  const d = sauvegarde.donnees;
  await sauvegarderObjectifs(d.objectifs);
  await sauvegarderDefis(d.defis);
  await sauvegarderJours(d.jours);
  await sauvegarderRappel(d.rappel);
  await sauvegarderGestionDefis(d.gestionDefis || {
    defiDuMomentId: "",
    defiDuMomentActif: false,
    frequencesHebdo: {},
  });
}

export function existeCopieAvantImport() {
  return localStorage.getItem(CLE_AVANT_IMPORT) !== null;
}

// Annule la dernière restauration (et peut être annulée à son tour : les deux versions s'échangent)
export async function annulerDernierImport() {
  const brut = localStorage.getItem(CLE_AVANT_IMPORT);
  if (!brut) return false;
  const verif = verifierSauvegarde(brut);
  if (!verif.ok) return false;
  await appliquerSauvegarde(verif.sauvegarde);
  return true;
}

// ---------- Dates d'affichage ----------

export function formaterDateHeure(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export function formaterCourt(iso) {
  const d = new Date(iso);
  if (cleDate(d) === cleDate(new Date())) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" });
}

// ---------- Stockage persistant (anti-nettoyage automatique) ----------

export async function rafraichirPersistant() {
  if (!navigator.storage || !navigator.storage.persisted) {
    maj({ persistant: "indisponible" });
    return;
  }
  try {
    maj({ persistant: (await navigator.storage.persisted()) ? "accorde" : "non" });
  } catch {
    maj({ persistant: "inconnu" });
  }
}

// memoriser = true : on se souvient que l'utilisateur est d'accord, et on redemandera
// discrètement à chaque lancement tant que le navigateur n'a pas dit oui.
export async function demanderPersistant(memoriser = true) {
  if (memoriser) ecrireLocal(CLE_ACCUEIL, { persistantDemande: true });
  if (!navigator.storage || !navigator.storage.persist) {
    maj({ persistant: "indisponible" });
    return "indisponible";
  }
  try {
    const deja = await navigator.storage.persisted();
    const accorde = deja || (await navigator.storage.persist());
    maj({ persistant: accorde ? "accorde" : "non" });
    return accorde ? "accorde" : "non";
  } catch {
    maj({ persistant: "non" });
    return "non";
  }
}

// ---------- Sauvegarde automatique dans un fichier ----------

let lien = null; // lien vers le fichier choisi (FileSystemFileHandle)
let verifie = false; // le fichier a-t-il été comparé aux données de l'appli depuis le lancement ?
let minuteur = null;
let enCours = false;
let aRecommencer = false;
let sauvegardeEnConflit = null;

function statutDepuisErreur(erreur) {
  const nom = erreur && erreur.name;
  if (nom === "NotFoundError") return "introuvable";
  if (nom === "NotAllowedError" || nom === "SecurityError") return "reconnecter";
  return "erreur";
}

async function ecrireDansFichier() {
  const sauvegarde = await construireSauvegarde();
  const flux = await lien.createWritable();
  try {
    await flux.write(JSON.stringify(sauvegarde, null, 2));
    await flux.close();
  } catch (erreur) {
    try {
      await flux.abort();
    } catch {
      // déjà fermé : on ignore
    }
    throw erreur;
  }
}

export async function sauvegarderMaintenant() {
  if (!lien || (etat.statut !== "ok" && etat.statut !== "erreur")) return;
  if (enCours) {
    aRecommencer = true;
    return;
  }
  enCours = true;
  try {
    const permission = await lien.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      maj({ statut: "reconnecter" });
      return;
    }

    // Sécurité : au premier passage, on vérifie qu'on n'écrase pas un fichier plus complet
    if (!verifie) {
      const fichier = await lien.getFile();
      const verif = verifierSauvegarde(await fichier.text());
      if (verif.ok) {
        const actuel = await construireSauvegarde();
        if (compterValides(verif.sauvegarde.donnees.jours) > compterValides(actuel.donnees.jours)) {
          sauvegardeEnConflit = verif.sauvegarde;
          maj({ statut: "conflit", conflit: verif.resume });
          return;
        }
      }
      verifie = true;
    }

    await ecrireDansFichier();
    const maintenant = new Date().toISOString();
    ecrireLocal(CLE_META, { derniereAuto: maintenant });
    maj({ statut: "ok", derniere: maintenant });
  } catch (erreur) {
    maj({ statut: statutDepuisErreur(erreur) });
  } finally {
    enCours = false;
    if (aRecommencer) {
      aRecommencer = false;
      sauvegarderMaintenant();
    }
  }
}

async function memoriserLien(fichier) {
  lien = fichier;
  verifie = false;
  try {
    await ecrireCoffre(CLE_LIEN_FICHIER, fichier);
  } catch {
    // le lien ne survivra pas à la fermeture de l'appli : on prévient plus bas si besoin
  }
  ecrireLocal(CLE_META, { nom: fichier.name });
  maj({ nom: fichier.name });
}

// À appeler une fois au lancement de l'appli
let initialise = false;

export async function initialiserSauvegarde() {
  if (initialise) return;
  initialise = true;

  // Écriture regroupée : on attend un court instant après la dernière modification
  window.addEventListener("habibits:donnees-modifiees", () => {
    clearTimeout(minuteur);
    minuteur = setTimeout(sauvegarderMaintenant, 1500);
  });
  // Si l'appli passe en arrière-plan, on écrit tout de suite
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearTimeout(minuteur);
      sauvegarderMaintenant();
    }
  });

  if (!etat.supporte) return;
  try {
    const fichier = await lireCoffre(CLE_LIEN_FICHIER);
    if (!fichier) return;
    lien = fichier;
    maj({ nom: fichier.name });
    const permission = await fichier.queryPermission({ mode: "readwrite" });
    if (permission === "granted") {
      maj({ statut: "ok" });
      await sauvegarderMaintenant();
    } else {
      maj({ statut: "reconnecter" });
    }
  } catch {
    // coffre indisponible (navigation privée, par exemple) : pas de sauvegarde automatique
  }
}

// L'utilisateur choisit où créer son fichier de sauvegarde (à appeler depuis un bouton)
export async function activerSauvegardeAuto() {
  if (!etat.supporte) return { ok: false, raison: "non-supporte" };
  try {
    const fichier = await window.showSaveFilePicker({
      suggestedName: "habibits-sauvegarde.json",
      ...OPTIONS_FICHIER,
    });
    await memoriserLien(fichier);
    verifie = true; // fichier choisi à l'instant : on peut écrire sans comparer
    maj({ statut: "ok", conflit: null });
    await sauvegarderMaintenant();
    return { ok: true };
  } catch (erreur) {
    if (erreur && erreur.name === "AbortError") return { ok: false, raison: "annule" };
    return { ok: false, raison: "erreur" };
  }
}

// L'utilisateur reconfirme l'accès au fichier (à appeler depuis un bouton)
export async function reconnecter() {
  if (!lien) return activerSauvegardeAuto();
  try {
    const permission = await lien.requestPermission({ mode: "readwrite" });
    if (permission !== "granted") return { ok: false, raison: "refuse" };
    maj({ statut: "ok" });
    await sauvegarderMaintenant();
    return { ok: true };
  } catch {
    return { ok: false, raison: "erreur" };
  }
}

export async function desactiverSauvegardeAuto() {
  lien = null;
  verifie = false;
  sauvegardeEnConflit = null;
  try {
    await effacerCoffre(CLE_LIEN_FICHIER);
  } catch {
    // rien à effacer
  }
  ecrireLocal(CLE_META, { nom: null, derniereAuto: null });
  maj({ statut: "inactive", nom: null, derniere: null, conflit: null });
}

// Le fichier contient plus d'historique que le téléphone : on récupère le fichier, ou on garde le téléphone
export async function resoudreConflit(choix) {
  if (choix === "restaurer" && sauvegardeEnConflit) {
    await appliquerSauvegarde(sauvegardeEnConflit);
    sauvegardeEnConflit = null;
    verifie = true;
    maj({ statut: "ok", conflit: null });
    return "recharger";
  }
  sauvegardeEnConflit = null;
  verifie = true;
  maj({ statut: "ok", conflit: null });
  await sauvegarderMaintenant();
  return "ok";
}

// ---------- Export ----------

export async function exporterDonnees() {
  const sauvegarde = await construireSauvegarde();
  const fichier = new File([JSON.stringify(sauvegarde, null, 2)], `habibits-${cleDate(new Date())}.json`, {
    type: "application/json",
  });

  const noter = () => {
    const maintenant = new Date().toISOString();
    ecrireLocal(CLE_META, { dernierExport: maintenant });
    maj({ dernierExport: maintenant });
  };

  // Sur téléphone : menu de partage (Fichiers, Drive, mail...)
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title: "Sauvegarde Habibits" });
      noter();
      return "partage";
    } catch (erreur) {
      if (erreur && erreur.name === "AbortError") return "annule";
      // autre problème : on tente le téléchargement
    }
  }

  // Sinon : téléchargement classique
  const adresse = URL.createObjectURL(fichier);
  const a = document.createElement("a");
  a.href = adresse;
  a.download = fichier.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(adresse), 1000);
  noter();
  return "telecharge";
}

// ---------- Restauration ----------

// Étape 1 : l'utilisateur choisit un fichier. Rien n'est modifié.
export async function choisirFichierARestaurer() {
  try {
    const [fichier] = await window.showOpenFilePicker({ ...OPTIONS_FICHIER, multiple: false });
    const contenu = await (await fichier.getFile()).text();
    return { ...verifierSauvegarde(contenu), handle: fichier, nom: fichier.name };
  } catch (erreur) {
    if (erreur && erreur.name === "AbortError") return { annule: true };
    return { ok: false, erreur: "Je n'ai pas réussi à ouvrir ce fichier. Réessaie ou choisis-en un autre." };
  }
}

// Même chose pour les navigateurs sans accès aux fichiers (sélecteur classique)
export async function lireFichierChoisi(fichier) {
  try {
    return { ...verifierSauvegarde(await fichier.text()), handle: null, nom: fichier.name };
  } catch {
    return { ok: false, erreur: "Je n'ai pas réussi à lire ce fichier. Réessaie ou choisis-en un autre." };
  }
}

// Étape 2 : l'utilisateur confirme. Les données sont remplacées.
export async function confirmerRestauration(choix, { continuerDansCeFichier }) {
  let lienChoisi = null;
  if (continuerDansCeFichier && choix.handle) {
    try {
      // Doit venir directement du clic de l'utilisateur : on le fait en premier
      const permission = await choix.handle.requestPermission({ mode: "readwrite" });
      if (permission === "granted") lienChoisi = choix.handle;
    } catch {
      // on restaure quand même, sans lien automatique
    }
  }
  await appliquerSauvegarde(choix.sauvegarde);
  if (lienChoisi) {
    await memoriserLien(lienChoisi);
    verifie = true;
    maj({ statut: "ok", conflit: null });
  }
}

// ---------- Rappel de sauvegarde manuelle ----------

// Nombre de jours validés depuis la dernière copie (fichier automatique ou export)
export function joursValidesSansSauvegarde(jours, e) {
  const dates = [e.derniere, e.dernierExport].filter(Boolean).sort();
  const derniere = dates.length ? dates[dates.length - 1].slice(0, 10) : "";
  return Object.entries(jours || {}).filter(([cle, j]) => j && j.fait && cle > derniere).length;
}

export function rappelEstMasque() {
  return lireLocal(CLE_META).rappelMasqueLe === cleDate(new Date());
}

export function masquerRappelAujourdhui() {
  ecrireLocal(CLE_META, { rappelMasqueLe: cleDate(new Date()) });
}
