export function cleDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

export function grilleDuMois(annee, mois) {
  const premier = new Date(annee, mois, 1);
  const decalage = (premier.getDay() + 6) % 7; // la semaine commence le lundi
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases = Array(decalage).fill(null);
  for (let j = 1; j <= nbJours; j++) cases.push(new Date(annee, mois, j));
  return cases;
}