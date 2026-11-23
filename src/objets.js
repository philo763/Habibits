import { cleDate } from "./dates.js";
import { debutSemaine } from "./recompenses.js";

export const OBJETS = [
  {
    id: "de",
    emoji: "🪩",
    nom: "Boule disco",
    combinaison: "Paire",
    info: "Permet de relancer le tirage du jour une fois.",
  },
  {
    id: "pomme",
    emoji: "🐫",
    nom: "Chameau",
    combinaison: "Double paire",
    info: "Double les pommes reçues en validant le défi du jour.",
  },
  {
    id: "baguette",
    emoji: "🐬",
    nom: "Dauphin",
    combinaison: "Brelan",
    info: "Permet de changer le défi que tu as choisi aujourd’hui.",
  },
  {
    id: "fusee",
    emoji: "🚀",
    nom: "Fusée",
    combinaison: "Carré",
    info: "Une fois ton défi validé, un nouveau bouton 🚀 te permet de le valider une deuxième fois.",
  },
  {
    id: "lotus",
    emoji: "🪷",
    nom: "Lotus",
    combinaison: "Suite",
    info: "Transforme le jour en jour de repos : la série n’est pas coupée.",
  },
  {
    id: "arc",
    emoji: "🔮",
    nom: "Boule de cristal",
    combinaison: "Full",
    info: "Débloque les tirages et les choix pour les 7 jours à venir. Un défi ne peut toujours pas être validé pour un jour futur.",
  },
  {
    id: "dauphin",
    emoji: "🪄",
    nom: "Baguette magique",
    combinaison: "Couleur",
    info: "Le défi choisi aujourd’hui sera dans le tirage de demain.",
  },
  {
    id: "diamant",
    emoji: "💎",
    nom: "Diamant",
    combinaison: "Suite couleur",
    info: "Se consomme pour obtenir l’objet de ton choix parmi ceux qu’on gagne au poker.",
  },
  {
    id: "miroir",
    emoji: "🪞",
    nom: "Miroir",
    combinaison: "À venir",
    avenir: true,
    info: "Écris un message pour toi : il s’affichera chaque fois que tu marques un défi comme non réussi.",
  },
  {
    id: "pinceau",
    emoji: "🎨",
    nom: "Palette de couleurs",
    combinaison: "À venir",
    avenir: true,
    info: "Permet de choisir la couleur de ton sac à dos.",
  },
];

export const OBJETS_POKER = ["de", "pomme", "baguette", "fusee", "lotus", "arc", "dauphin"];
// Une deuxième utilisation le même jour n'apporterait rien.
const OBJETS_EFFET_UNIQUE = ["pomme", "fusee", "lotus", "arc"];

const IDS = OBJETS.map((objet) => objet.id);
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function decalerJour(cle, nombre) {
  const date = new Date(`${cle}T00:00:00`);
  date.setDate(date.getDate() + nombre);
  return cleDate(date);
}

// Objets utilisés un jour donné. Les anciens jours n'ont qu'un champ `objetUtilise`.
export function objetsUtilisesDuJour(jour) {
  if (Array.isArray(jour?.objetsUtilises)) return jour.objetsUtilises;
  return jour?.objetUtilise ? [jour.objetUtilise] : [];
}

export const aUtilise = (jour, id) => objetsUtilisesDuJour(jour).includes(id);

// Objets obtenus avec un diamant ce jour-là. Les anciens jours n'ont qu'un champ `diamantChoix`.
export function diamantsDuJour(jour) {
  if (Array.isArray(jour?.diamantsChoisis)) return jour.diamantsChoisis;
  return jour?.diamantChoix ? [jour.diamantChoix] : [];
}

export function limiteTirage(jours, aujourdhui) {
  let limite = decalerJour(aujourdhui, 1);
  Object.entries(jours || {}).forEach(([date, jour]) => {
    if (!aUtilise(jour, "arc") || !FORMAT_DATE.test(date)) return;
    const fin = decalerJour(date, 7);
    if (fin > limite) limite = fin;
  });
  return limite;
}

function categorieDuJour(jour, date) {
  return jour.objectifCopie?.id || jour.defiCopie?.objectifId || `?${date}`;
}

const NIVEAU_DIFFICULTE = { facile: 1, moyen: 2, difficile: 3 };

// Premier lundi où les semaines suivent les nouvelles règles (trous qui cassent la série,
// semaine coupée au changement de mois). Les semaines plus anciennes gardent l'ancienne
// règle pour qu'aucun objet déjà gagné ne disparaisse. Les colonnes, elles, comptent
// pour tout l'historique.
export const DATE_BASCULE_POKER = "2026-11-23";

export const SENS_MAIN = {
  semaine: "sur la semaine",
  colonne: "en colonne",
};

// Une carte : un jour réussi. Un jour de repos (lotus) est neutre ; tout autre jour
// (raté, vide, pas encore validé) est un trou.
function natureDuJour(jour) {
  if (jour?.fait) return "carte";
  if (aUtilise(jour, "lotus")) return "neutre";
  return "trou";
}

// Évalue une main (cartes dans l'ordre chronologique) et appelle `ajouter` dès qu'un coup est atteint.
function evaluerMain(cartes, ajouter) {
  const etat = { valeurs: {}, paires: {}, categories: {}, categoriesValeurs: {}, obtenus: new Set() };
  cartes.forEach(({ date, jour }) => {
    const difficulte = jour.defiCopie?.difficulte;
    const categorie = categorieDuJour(jour, date);
    const unique = (cle, combinaison, objet) => {
      if (etat.obtenus.has(cle)) return;
      etat.obtenus.add(cle);
      ajouter(date, combinaison, objet);
    };

    etat.categories[categorie] = (etat.categories[categorie] || 0) + 1;
    if (etat.categories[categorie] === 5) unique(`couleur-${categorie}`, "Couleur", "dauphin");

    const niveau = NIVEAU_DIFFICULTE[difficulte];
    if (!niveau) return;
    etat.valeurs[difficulte] = (etat.valeurs[difficulte] || 0) + 1;
    const effectif = etat.valeurs[difficulte];
    etat.categoriesValeurs[categorie] = new Set([...(etat.categoriesValeurs[categorie] || []), difficulte]);

    const pairesDeCetteValeur = Math.floor(effectif / 2);
    if (pairesDeCetteValeur > (etat.paires[difficulte] || 0)) {
      etat.paires[difficulte] = pairesDeCetteValeur;
      ajouter(date, "Paire", "de", niveau);
    }
    if (Object.values(etat.paires).reduce((total, nombre) => total + nombre, 0) >= 2) {
      unique("double-paire", "Double paire", "pomme");
    }
    if (effectif >= 3) unique(`brelan-${difficulte}`, "Brelan", "baguette");
    if (effectif >= 4) unique(`carre-${difficulte}`, "Carré", "fusee");

    const effectifs = Object.values(etat.valeurs);
    if (effectifs.some((n) => n >= 3) && effectifs.filter((n) => n >= 2).length >= 2) unique("full", "Full", "arc");
    if (Object.keys(NIVEAU_DIFFICULTE).every((nom) => etat.valeurs[nom] > 0)) unique("suite", "Suite", "lotus");
    if (etat.categoriesValeurs[categorie].size === 3) unique("suite-couleur", "Suite couleur", "diamant");
  });
}

// Découpe une suite de dates en séries de cartes : un trou termine la série, un jour neutre est ignoré.
function series(dates, jours) {
  const resultat = [];
  let courante = [];
  dates.forEach((date) => {
    const nature = natureDuJour(jours[date]);
    if (nature === "carte") courante.push({ date, jour: jours[date] });
    else if (nature === "trou" && courante.length) {
      resultat.push(courante);
      courante = [];
    }
  });
  if (courante.length) resultat.push(courante);
  return resultat;
}

const moisDe = (date) => date.slice(0, 7);

export function calculerObjets(jours) {
  const gagnes = Object.fromEntries(IDS.map((id) => [id, 0]));
  const evenements = [];
  const datesReussies = Object.keys(jours || {}).filter((date) => FORMAT_DATE.test(date) && jours[date]?.fait).sort();

  const ajouterPour = (sens) => (date, combinaison, objet, nombre = 1) => {
    gagnes[objet] += nombre;
    evenements.push({ date, combinaison, objet, nombre, sens });
  };

  // Lignes : une semaine du lundi au dimanche
  const semaines = [...new Set(datesReussies.map(debutSemaine))];
  semaines.forEach((lundi) => {
    const datesSemaine = Array.from({ length: 7 }, (_, i) => decalerJour(lundi, i));
    if (lundi < DATE_BASCULE_POKER) {
      // Ancienne règle : toutes les cartes de la semaine forment une seule main
      const cartes = datesSemaine.filter((date) => jours[date]?.fait).map((date) => ({ date, jour: jours[date] }));
      evaluerMain(cartes, ajouterPour("semaine"));
      return;
    }
    // Nouvelle règle : la semaine est coupée au changement de mois, puis à chaque trou
    [...new Set(datesSemaine.map(moisDe))].forEach((mois) => {
      series(datesSemaine.filter((date) => moisDe(date) === mois), jours)
        .forEach((serie) => evaluerMain(serie, ajouterPour("semaine")));
    });
  });

  // Colonnes : le même jour de la semaine dans un mois, sur tout l'historique
  const mois = [...new Set(datesReussies.map(moisDe))];
  mois.forEach((cleMois) => {
    const [annee, numeroMois] = cleMois.split("-").map(Number);
    const nombreJours = new Date(annee, numeroMois, 0).getDate();
    for (let premier = 1; premier <= 7; premier++) {
      const dates = [];
      for (let jour = premier; jour <= nombreJours; jour += 7) {
        dates.push(`${cleMois}-${String(jour).padStart(2, "0")}`);
      }
      series(dates, jours).forEach((serie) => evaluerMain(serie, ajouterPour("colonne")));
    }
  });

  evenements.sort((a, b) => a.date.localeCompare(b.date));

  const utilises = Object.fromEntries(IDS.map((id) => [id, 0]));
  Object.values(jours || {}).forEach((jour) => {
    objetsUtilisesDuJour(jour).forEach((id) => {
      if (IDS.includes(id)) utilises[id] += 1;
    });
    diamantsDuJour(jour).forEach((id) => {
      if (!OBJETS_POKER.includes(id)) return;
      utilises.diamant += 1;
      gagnes[id] += 1;
    });
  });
  const inventaire = Object.fromEntries(IDS.map((id) => [id, Math.max(0, gagnes[id] - utilises[id])]));

  return { gagnes, inventaire, evenements };
}

// Coups de poker gagnés entre deux calculs : regroupés par sens, main et objet.
export function nouveauxCoups(evenementsAvant, evenementsApres) {
  const compter = (evenements) => evenements.reduce((totaux, { sens, combinaison, objet, nombre }) => {
    const cle = `${sens}|${combinaison}|${objet}`;
    totaux.set(cle, (totaux.get(cle) || 0) + nombre);
    return totaux;
  }, new Map());
  const avant = compter(evenementsAvant);
  return [...compter(evenementsApres)]
    .filter(([cle, nombre]) => nombre > (avant.get(cle) || 0))
    .map(([cle, nombre]) => {
      const [sens, combinaison, objet] = cle.split("|");
      return { ...OBJETS.find((item) => item.id === objet), cle, sens, combinaison, nombre: nombre - (avant.get(cle) || 0) };
    });
}

export function messageMiroir(jours) {
  const dates = Object.keys(jours || {}).filter((date) => FORMAT_DATE.test(date) &&
    aUtilise(jours[date], "miroir") && typeof jours[date].miroirMessage === "string" &&
    jours[date].miroirMessage.trim()).sort();
  return dates.length ? jours[dates[dates.length - 1]].miroirMessage.trim() : "";
}
export function pommesBonusObjets(jours) {
  return Object.values(jours || {}).reduce((total, jour) => (
    aUtilise(jour, "pomme") && jour.fait && Number.isInteger(jour.recompenseCaca)
      ? total + Math.max(0, jour.recompenseCaca)
      : total
  ), 0);
}

// Renvoie { ok, raison } pour un objet à utiliser aujourd'hui.
export function statutObjet(id, { jours, aujourdhui, inventaire, defiChoisiExiste }) {
  const jour = jours[aujourdhui] || {};
  const demain = jours[decalerJour(aujourdhui, 1)] || {};
  const propositions = Array.isArray(jour.propositions) ? jour.propositions : [];
  const termine = Boolean(jour.fait || jour.nonReussi);

  if (id === "miroir" || id === "pinceau") return { ok: false, raison: "Cet objet est à venir : on ne peut pas encore l’obtenir." };
  if (id === "diamant") {
    if (!inventaire.diamant) return { ok: false, raison: "Tu n’as pas de diamant. Forme une suite couleur pour en gagner un." };
    return { ok: true, raison: "" };
  }
  if (!inventaire[id]) return { ok: false, raison: "Tu n’as pas encore cet objet. Forme une combinaison pour le gagner." };
  // Pas de limite par jour, mais on évite de dépenser un objet qui n'aurait aucun effet.
  if (OBJETS_EFFET_UNIQUE.includes(id) && aUtilise(jour, id)) {
    return { ok: false, raison: "Cet objet est déjà actif aujourd’hui : en utiliser un autre ne changerait rien." };
  }
  if (id !== "arc" && aUtilise(jour, "lotus") && !jour.fait) {
    return { ok: false, raison: "Aujourd’hui est un jour de repos : pas de défi à modifier." };
  }

  if (id === "de") {
    if (jour.choisi) return { ok: false, raison: "Tu as déjà choisi ton défi du jour : la boule disco ne sert qu’avant de choisir." };
    if (termine) return { ok: false, raison: "Le défi du jour est déjà terminé." };
    if (propositions.length === 0) return { ok: false, raison: "Tire d’abord tes défis du jour dans le calendrier." };
  } else if (id === "fusee") {
    if (!jour.choisi) return { ok: false, raison: "Choisis d’abord un défi parmi les trois dans le calendrier." };
    if (jour.nonReussi) return { ok: false, raison: "Le défi du jour n’a pas été réussi : la fusée ne peut plus servir." };
  } else if (id === "baguette" || id === "pomme") {
    if (!jour.choisi) return { ok: false, raison: "Choisis d’abord un défi parmi les trois dans le calendrier." };
    if (termine) return { ok: false, raison: "Le défi du jour est déjà validé : cet objet doit être utilisé avant la validation." };
  } else if (id === "lotus") {
    if (termine) return { ok: false, raison: "Tu as déjà validé ou invalidé un défi aujourd’hui." };
  } else if (id === "dauphin") {
    if (!jour.choisi || !defiChoisiExiste) return { ok: false, raison: "Choisis d’abord un défi parmi les trois dans le calendrier." };
    if (demain.choisi) return { ok: false, raison: "Le défi de demain est déjà choisi." };
    if (demain.dauphinDefiId === jour.choisi) return { ok: false, raison: "Ce défi est déjà prévu dans le tirage de demain." };
  }
  return { ok: true, raison: "" };
}
