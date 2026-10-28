export const CATEGORIES_BIBIT = [
  { id: "couleur", nom: "Couleurs" },
  { id: "corps", nom: "Corps" },
  { id: "accessoire", nom: "Accessoires" },
  { id: "habit", nom: "Habibits", aVenir: true },
];

export const OPTIONS_BASE_BIBIT = {
  couleur: { id: "rose", nom: "Rose", couleur: "#f7cde0" },
  corps: { id: "simples", nom: "Yeux simples" },
  accessoire: { id: "aucun", nom: "Aucun" },
  habit: { id: "aucun", nom: "Aucun habit" },
};

export const COULEURS_BIBIT = {
  rose: "#f7cde0",
  "couleur-turquoise": "#70d7cf",
  "couleur-violet": "#bca4f4",
  "couleur-jaune": "#ffda69",
};

export const ARTICLES_BIBIT = [
  { id: "couleur-turquoise", categorie: "couleur", nom: "Turquoise", description: "Une teinte fraîche et lumineuse.", prix: 5, couleur: "#70d7cf" },
  { id: "couleur-violet", categorie: "couleur", nom: "Violet", description: "Une couleur douce aux reflets rêveurs.", prix: 5, couleur: "#bca4f4" },
  { id: "couleur-jaune", categorie: "couleur", nom: "Jaune soleil", description: "Un jaune joyeux qui illumine le Bibit.", prix: 5, couleur: "#ffda69" },
  { id: "yeux-ronds", categorie: "corps", nom: "Yeux ronds", description: "De grands yeux bien ouverts.", prix: 10 },
  { id: "yeux-coeurs", categorie: "corps", nom: "Yeux cœurs", description: "Un regard plein de tendresse.", prix: 10 },
  { id: "yeux-spirales", categorie: "corps", nom: "Yeux spirales", description: "Un regard un peu étourdi.", prix: 20, disponible: false },
  { id: "accessoire-noeud", categorie: "accessoire", nom: "Petit nœud", description: "Un joli nœud posé sur la tête.", prix: 5, disponible: false },
  { id: "accessoire-fleur", categorie: "accessoire", nom: "Fleur", description: "Une fleur colorée à porter fièrement.", prix: 15 },
  { id: "accessoire-couronne", categorie: "accessoire", nom: "Couronne", description: "Une petite couronne pour les grandes journées.", prix: 15 },
  { id: "habit-pull", categorie: "habit", nom: "Pull", description: "Un pull tout doux et bien chaud.", prix: 5, disponible: false },
  { id: "habit-cape", categorie: "habit", nom: "Cape", description: "Une cape prête pour l’aventure.", prix: 10, disponible: false },
  { id: "habit-salopette", categorie: "habit", nom: "Salopette", description: "Une salopette confortable avec une poche.", prix: 20, disponible: false },
];

export const ETAT_BIBIT_INITIAL = {
  achats: [],
  equipe: {
    couleur: OPTIONS_BASE_BIBIT.couleur.id,
    corps: OPTIONS_BASE_BIBIT.corps.id,
    accessoire: OPTIONS_BASE_BIBIT.accessoire.id,
    habit: OPTIONS_BASE_BIBIT.habit.id,
  },
};

export function normaliserBibit(valeur) {
  const articlesParId = new Map(ARTICLES_BIBIT.map((article) => [article.id, article]));
  const achats = [];
  const articlesPossedes = new Set();
  (Array.isArray(valeur?.achats) ? valeur.achats : []).forEach((achat) => {
    const article = articlesParId.get(achat?.articleId);
    if (!article || articlesPossedes.has(article.id)) return;
    articlesPossedes.add(article.id);
    achats.push({
      articleId: article.id,
      prix: Number.isInteger(achat.prix) && achat.prix >= 0 ? achat.prix : article.prix,
      dateAchat: typeof achat.dateAchat === "string" ? achat.dateAchat : "",
    });
  });

  const equipe = {};
  CATEGORIES_BIBIT.forEach(({ id }) => {
    const choisi = id === "corps"
      ? valeur?.equipe?.corps ?? valeur?.equipe?.yeux
      : valeur?.equipe?.[id];
    const articleEquipe = articlesParId.get(choisi);
    const optionBase = OPTIONS_BASE_BIBIT[id];
    equipe[id] = choisi === optionBase.id ||
      (articleEquipe?.categorie === id && articlesPossedes.has(articleEquipe.id))
      ? choisi
      : optionBase.id;
  });
  return { achats, equipe };
}
