import { cleDate } from "./dates.js";

const RECOMPENSES_PAR_DIFFICULTE = {
  facile: 1,
  moyen: 3,
  difficile: 5,
};

export function recompensePourDifficulte(difficulte) {
  return Object.hasOwn(RECOMPENSES_PAR_DIFFICULTE, difficulte)
    ? RECOMPENSES_PAR_DIFFICULTE[difficulte]
    : 0;
}

export function debutSemaine(cle) {
  const date = new Date(`${cle}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return null;
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return cleDate(date);
}

export function calculerRecompenses(jours) {
  let recompenses = 0;
  const coeurs = Object.values(jours).filter((jour) => jour?.nonReussi === true).length;
  const semaines = new Map();

  Object.entries(jours).forEach(([date, jour]) => {
    const montant = Number.isInteger(jour?.recompenseCaca) && jour.recompenseCaca > 0
      ? jour.recompenseCaca
      : 0;
    if (!jour?.fait || !montant) return;

    recompenses += montant;
    if (typeof jour.defiDuMomentIdLorsValidation !== "string" || !jour.defiDuMomentIdLorsValidation) return;

    const semaine = debutSemaine(date);
    if (!semaine) return;
    const cle = `${semaine}:${jour.defiDuMomentIdLorsValidation}`;
    const groupe = semaines.get(cle) || {
      semaine,
      defiId: jour.defiDuMomentIdLorsValidation,
      nombre: 0,
      recompenses: 0,
      objectifs: [],
      jours: [],
    };
    groupe.nombre += 1;
    groupe.recompenses += montant;
    groupe.jours.push(date);
    groupe.objectifs.push({
      date,
      nombre: Number.isInteger(jour.objectifHebdoDefiMoment) &&
        jour.objectifHebdoDefiMoment >= 1 && jour.objectifHebdoDefiMoment <= 7
        ? jour.objectifHebdoDefiMoment
        : 3,
    });
    semaines.set(cle, groupe);
  });

  let bonus = 0;
  const suivisHebdomadaires = [...semaines.values()].map((groupe) => {
    groupe.jours.sort();
    groupe.objectifs.sort((a, b) => a.date.localeCompare(b.date));
    groupe.objectif = groupe.objectifs[0].nombre;
    delete groupe.objectifs;
    groupe.bonus = groupe.nombre >= groupe.objectif ? groupe.recompenses : 0;
    bonus += groupe.bonus;
    return groupe;
  });

  return {
    solde: recompenses + bonus,
    recompenses,
    bonus,
    coeurs,
    suivisHebdomadaires,
  };
}
