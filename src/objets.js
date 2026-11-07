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

const IDS = OBJETS.map((objet) => objet.id);
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function decalerJour(cle, nombre) {
  const date = new Date(`${cle}T00:00:00`);
  date.setDate(date.getDate() + nombre);
  return cleDate(date);
}

export function limiteTirage(jours, aujourdhui) {
  let limite = decalerJour(aujourdhui, 1);
  Object.entries(jours || {}).forEach(([date, jour]) => {
    if (jour?.objetUtilise !== "arc" || !FORMAT_DATE.test(date)) return;
    const fin = decalerJour(date, 7);
    if (fin > limite) limite = fin;
  });
  return limite;
}

function categorieDuJour(jour, date) {
  return jour.objectifCopie?.id || jour.defiCopie?.objectifId || `?${date}`;
}

const NIVEAU_DIFFICULTE = { facile: 1, moyen: 2, difficile: 3 };

export function calculerObjets(jours) {
  const gagnes = Object.fromEntries(IDS.map((id) => [id, 0]));
  const evenements = [];
  const semaines = new Map();

  const ajouter = (date, combinaison, objet, nombre = 1) => {
    gagnes[objet] += nombre;
    evenements.push({ date, combinaison, objet, nombre });
  };

  Object.keys(jours || {}).filter((date) => FORMAT_DATE.test(date)).sort().forEach((date) => {
    const jour = jours[date];
    if (!jour?.fait) return;
    const difficulte = jour.defiCopie?.difficulte;
    const categorie = categorieDuJour(jour, date);
    const semaine = debutSemaine(date);
    if (!semaines.has(semaine)) {
      semaines.set(semaine, { valeurs: {}, paires: {}, categories: {}, categoriesValeurs: {}, obtenus: new Set() });
    }
    const etat = semaines.get(semaine);
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

  const utilises = Object.fromEntries(IDS.map((id) => [id, 0]));
  Object.values(jours || {}).forEach((jour) => {
    if (IDS.includes(jour?.objetUtilise)) utilises[jour.objetUtilise] += 1;
    if (OBJETS_POKER.includes(jour?.diamantChoix)) {
      utilises.diamant += 1;
      gagnes[jour.diamantChoix] += 1;
    }
  });
  const inventaire = Object.fromEntries(IDS.map((id) => [id, Math.max(0, gagnes[id] - utilises[id])]));

  return { gagnes, inventaire, evenements };
}

export function messageMiroir(jours) {
  const dates = Object.keys(jours || {}).filter((date) => FORMAT_DATE.test(date) &&
    jours[date]?.objetUtilise === "miroir" && typeof jours[date].miroirMessage === "string" &&
    jours[date].miroirMessage.trim()).sort();
  return dates.length ? jours[dates[dates.length - 1]].miroirMessage.trim() : "";
}
export function pommesBonusObjets(jours) {
  return Object.values(jours || {}).reduce((total, jour) => (
    jour?.objetUtilise === "pomme" && jour.fait && Number.isInteger(jour.recompenseCaca)
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
    if (jour.diamantChoix) return { ok: false, raison: "Tu as déjà consommé un diamant aujourd’hui." };
    if (!inventaire.diamant) return { ok: false, raison: "Tu n’as pas de diamant. Forme une suite couleur pour en gagner un." };
    return { ok: true, raison: "" };
  }
  if (jour.objetUtilise) return { ok: false, raison: "Tu as déjà utilisé un objet aujourd’hui. Reviens demain !" };
  if (!inventaire[id]) return { ok: false, raison: "Tu n’as pas encore cet objet. Forme une combinaison pour le gagner." };

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
  }
  return { ok: true, raison: "" };
}
