const DIFFICULTES = ["facile", "moyen", "difficile"];

export function melanger(liste) {
  const melangee = [...liste];
  for (let i = melangee.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [melangee[i], melangee[j]] = [melangee[j], melangee[i]];
  }
  return melangee;
}

// Un défi imposé (dauphin) prend la place de celui de sa difficulté, avant le défi du moment.
export function tirerDefis(defis, defiDuMoment = null, defiImpose = null) {
  const tirage = DIFFICULTES.flatMap((difficulte) => {
    if (defiImpose?.difficulte === difficulte) return [defiImpose];
    if (defiDuMoment?.difficulte === difficulte) return [defiDuMoment];
    const defi = melanger(defis.filter((element) => element.difficulte === difficulte))[0];
    return defi ? [defi] : [];
  });
  while (tirage.length < 3) {
    const disponibles = defis.filter((defi) => !tirage.some((selectionne) => selectionne.id === defi.id));
    if (disponibles.length === 0) break;
    tirage.push(melanger(disponibles)[0]);
  }
  return tirage.length < 3 ? null : tirage;
}
