// ---------------------------------------------------------------------------
// Collection de cartes
//  - chaque défi a un numéro de carte fixe (`numero`), attribué à sa création
//  - les cartes gagnées sont lues dans les jours (validation + « Ajouter à la collection »)
// ---------------------------------------------------------------------------

const numeroValide = (numero) => Number.isInteger(numero) && numero > 0;

// Copies de défis gardées dans les jours (validations, échecs, ancien historique de collection)
function copiesDansJours(jours) {
  return Object.values(jours || {}).flatMap((jour) => [
    jour?.defiCopie,
    ...(Array.isArray(jour?.collectionHistorique) ? jour.collectionHistorique.map((carte) => carte?.defiCopie) : []),
  ]).filter((copie) => copie && typeof copie.id === "string");
}

// Numéro à donner au prochain défi créé : jamais un numéro déjà vu (défi actuel ou supprimé)
export function prochainNumero(defis, jours) {
  const numeros = [...defis, ...copiesDansJours(jours)].map((defi) => defi.numero).filter(numeroValide);
  return numeros.length === 0 ? 1 : Math.max(...numeros) + 1;
}

// Mise à niveau des données :
//  - numérote les défis qui n'ont pas encore de numéro (actuels et supprimés), par date de création,
//    et reporte le numéro dans les copies gardées dans les jours ;
//  - les défis du moment validés avant que l'ajout à la collection soit demandé pour eux
//    (`collectionne` absent) y étaient ajoutés automatiquement : ils y restent.
// Renvoie les mêmes objets si rien ne change.
export function normaliserCollection(defis, jours) {
  const numeros = new Map();
  for (const defi of [...defis, ...copiesDansJours(jours)]) {
    if (numeroValide(defi.numero) && !numeros.has(defi.id)) numeros.set(defi.id, defi.numero);
  }

  const aNumeroter = new Map();
  [...defis, ...copiesDansJours(jours)].forEach((defi, index) => {
    if (!numeros.has(defi.id) && !aNumeroter.has(defi.id)) {
      aNumeroter.set(defi.id, { id: defi.id, dateCreation: defi.dateCreation || "", index });
    }
  });
  let suivant = numeros.size === 0 ? 1 : Math.max(...numeros.values()) + 1;
  [...aNumeroter.values()]
    .sort((a, b) => a.dateCreation.localeCompare(b.dateCreation) || a.index - b.index)
    .forEach(({ id }) => numeros.set(id, suivant++));

  const avecNumero = (defi) => (defi.numero === numeros.get(defi.id) ? defi : { ...defi, numero: numeros.get(defi.id) });
  const nouveauxDefis = defis.some((defi) => defi.numero !== numeros.get(defi.id)) ? defis.map(avecNumero) : defis;

  let joursModifies = false;
  const nouveauxJours = {};
  for (const [date, jour] of Object.entries(jours || {})) {
    let nouveauJour = jour;
    if (jour?.defiCopie && typeof jour.defiCopie.id === "string" && jour.defiCopie.numero !== numeros.get(jour.defiCopie.id)) {
      nouveauJour = { ...nouveauJour, defiCopie: avecNumero(jour.defiCopie) };
    }
    if (Array.isArray(jour?.collectionHistorique) &&
      jour.collectionHistorique.some((carte) => carte?.defiCopie && carte.defiCopie.numero !== numeros.get(carte.defiCopie.id))) {
      nouveauJour = {
        ...nouveauJour,
        collectionHistorique: jour.collectionHistorique.map((carte) =>
          carte?.defiCopie && typeof carte.defiCopie.id === "string" ? { ...carte, defiCopie: avecNumero(carte.defiCopie) } : carte),
      };
    }
    if (jour?.fait && jour.choisi && jour.defiDuMomentIdLorsValidation === jour.choisi && jour.collectionne === undefined) {
      nouveauJour = { ...nouveauJour, collectionne: true };
    }
    if (nouveauJour !== jour) joursModifies = true;
    nouveauxJours[date] = nouveauJour;
  }

  return { defis: nouveauxDefis, jours: joursModifies ? nouveauxJours : jours };
}

// Toutes les cartes à afficher dans la collection, par numéro :
//  - chaque défi actuel (obtenu ou non) ;
//  - chaque défi supprimé dont on a gagné au moins une carte (marqué `supprime`).
// `exemplaires` liste les cartes gagnées, de la plus récente à la plus ancienne.
export function cartesCollection(defis, jours) {
  const exemplairesParId = new Map();
  const copieParId = new Map();
  const ajouter = (id, date, moment, copie, objectifCopie) => {
    if (!exemplairesParId.has(id)) exemplairesParId.set(id, []);
    exemplairesParId.get(id).push({ date, moment });
    if (copie && (!copieParId.has(id) || date > copieParId.get(id).date)) {
      copieParId.set(id, { date, copie, objectifCopie: objectifCopie || null });
    }
  };

  for (const [date, jour] of Object.entries(jours || {})) {
    if (jour?.fait && jour.choisi && jour.collectionne) {
      ajouter(jour.choisi, date, jour.defiDuMomentIdLorsValidation === jour.choisi, jour.defiCopie, jour.objectifCopie);
    }
    (Array.isArray(jour?.collectionHistorique) ? jour.collectionHistorique : []).forEach((carte) => {
      if (carte?.id) ajouter(carte.id, date, false, carte.defiCopie, carte.objectifCopie);
    });
  }

  const cartes = defis.map((defi) => ({
    id: defi.id,
    defi,
    objectifCopie: copieParId.get(defi.id)?.objectifCopie || null,
    supprime: false,
  }));
  for (const [id, { copie, objectifCopie }] of copieParId) {
    if (!defis.some((defi) => defi.id === id)) cartes.push({ id, defi: copie, objectifCopie, supprime: true });
  }

  return cartes
    .map((carte) => ({
      ...carte,
      exemplaires: (exemplairesParId.get(carte.id) || []).sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => (a.defi.numero || Infinity) - (b.defi.numero || Infinity) || a.id.localeCompare(b.id));
}
