export const COULEURS_OBJECTIF = [
  { id: "bleu", nom: "Bleu", valeur: "#4aa3ff" },
  { id: "cyan", nom: "Cyan", valeur: "#24c7d9" },
  { id: "turquoise", nom: "Turquoise", valeur: "#2fc5a2" },
  { id: "vert", nom: "Ardoise", valeur: "#8596ad" },
  { id: "citron", nom: "Citron", valeur: "#b5cf4a" },
  { id: "or", nom: "Or", valeur: "#f5c542" },
  { id: "orange", nom: "Magenta", valeur: "#d45c9f" },
  { id: "corail", nom: "Taupe", valeur: "#9b806f" },
  { id: "rose", nom: "Rose", valeur: "#e879b9" },
  { id: "violet", nom: "Violet", valeur: "#a77bea" },
];

export function couleurObjectif(id) {
  return COULEURS_OBJECTIF.find((couleur) => couleur.id === id)?.valeur || COULEURS_OBJECTIF[0].valeur;
}

export function normaliserDonneesDefis(defisBruts, objectifsBruts = null) {
  const objectifs = Array.isArray(objectifsBruts)
    ? objectifsBruts
        .filter((objectif) => objectif && typeof objectif.id === "string" && typeof objectif.nom === "string" && objectif.nom.trim())
        .map((objectif) => ({
          id: objectif.id,
          nom: objectif.nom,
          couleur: COULEURS_OBJECTIF.some((couleur) => couleur.id === objectif.couleur) ? objectif.couleur : "bleu",
        }))
    : [];

  const parNom = new Map(objectifs.map((objectif) => [objectif.nom, objectif]));
  for (const defi of defisBruts) {
    const nom = typeof defi.categorie === "string" ? defi.categorie : "";
    if (!nom.trim() || parNom.has(nom)) continue;
    const couleur = COULEURS_OBJECTIF.some((option) => option.id === defi.couleurObjectif)
      ? defi.couleurObjectif
      : "bleu";
    const objectif = { id: crypto.randomUUID(), nom, couleur };
    objectifs.push(objectif);
    parNom.set(nom, objectif);
  }

  const idsObjectifs = new Set(objectifs.map((objectif) => objectif.id));
  const maintenant = new Date().toISOString();
  const defis = defisBruts.map((defi) => {
    const { categorie, couleurObjectif: _couleurObjectif, ...reste } = defi;
    const dateCreation =
      typeof defi.dateCreation === "string" && Number.isFinite(Date.parse(defi.dateCreation))
        ? defi.dateCreation
        : maintenant;
    const objectifLegacy = typeof categorie === "string" ? parNom.get(categorie) : null;
    const objectifId = idsObjectifs.has(defi.objectifId) ? defi.objectifId : objectifLegacy?.id;
    return {
      ...reste,
      dateCreation,
      ...(objectifId ? { objectifId } : {}),
    };
  });

  return { defis, objectifs };
}
