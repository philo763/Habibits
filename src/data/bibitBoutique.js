export const CATEGORIES_BIBIT = [
  { id: "couleur", nom: "COULEUR", sousCategories: [
    { id: "unie", nom: "Uni", emplacement: "couleur", optionBase: true },
    { id: "motif", nom: "Motif", emplacement: "couleur" },
    { id: "special", nom: "Spécial", emplacement: "couleur" },
  ] },
  { id: "corps", nom: "CORPS", sousCategories: [
    { id: "yeux", nom: "Yeux", emplacement: "yeux", optionBase: true },
    { id: "joues", nom: "Joues", emplacement: "joues", optionBase: true },
    { id: "bouche", nom: "Bouche", emplacement: "bouche", optionBase: true },
    { id: "oreilles", nom: "Oreilles", emplacement: "oreilles", optionBase: true },
    { id: "dos", nom: "Dos", emplacement: "dos", optionBase: true },
    { id: "pieds", nom: "Pieds", emplacement: "pieds", optionBase: true },
  ] },
  { id: "habibits", nom: "HABIBITS", sousCategories: [
    { id: "chapeaux", nom: "Chapeaux", emplacement: "accessoire", optionBase: true },
    { id: "vetements", nom: "Vêtements", emplacement: "habit", optionBase: true },
  ] },
  { id: "fond", nom: "FOND", sousCategories: [
    { id: "unie", nom: "Uni", emplacement: "fond", optionBase: true },
    { id: "motif", nom: "Motif", emplacement: "fond" },
    { id: "special", nom: "Spécial", emplacement: "fond" },
  ] },
];

export const OPTIONS_BASE_BIBIT = {
  couleur: { id: "rose", nom: "Rose Bibit", couleur: "#f7cde0" },
  yeux: { id: "simples", nom: "Bibit classique" },
  joues: { id: "joues-classiques", nom: "Bibit classique" },
  bouche: { id: "bouche-classique", nom: "Bibit classique" },
  oreilles: { id: "oreilles-classiques", nom: "Bibit classique" },
  dos: { id: "dos-classique", nom: "Bibit classique" },
  pieds: { id: "pieds-classiques", nom: "Bibit classique" },
  accessoire: { id: "aucun", nom: "Aucun chapeau" },
  habit: { id: "aucun", nom: "Aucun vêtement" },
  fond: { id: "fond-classique", nom: "Classique Bibit" },
};

export const OPTIONS_AUCUN_BIBIT = {
  yeux: { id: "aucun", nom: "Aucun" },
  joues: { id: "aucun", nom: "Aucun" },
  bouche: { id: "aucun", nom: "Aucun" },
  oreilles: { id: "aucun", nom: "Aucun" },
  dos: { id: "aucun", nom: "Aucun" },
  pieds: { id: "aucun", nom: "Aucun" },
};

export const COULEURS_BIBIT = {
  rose: "#f7cde0",
  "couleur-turquoise": "#70d7cf",
  "couleur-violet": "#9810FA",
  "couleur-jaune": "#ffda69",
  "couleur-jaune-pika": "#fddd16",
  "couleur-menthe": "#8bd9ae",
  "couleur-corail": "#ff9878",
  "couleur-bleu-ciel": "#267BF1",
  "couleur-bleu-nuit": "#26334f",
  "couleur-gris-souris": "#9b9ba0",
  "couleur-vanille-madagascar": "#f3e5b3",
  "couleur-chocolat-lait": "#795548",
  "couleur-chocolat-noir": "#4E342E",
  "couleur-peche": "#ffc5a1",
  "couleur-abricot": "#f4a261",
  "couleur-lavande": "#b7a1d8",
  "couleur-baby-blue": "#A2EFFE",
  "couleur-vert-emeraude": "#3eaa75",
  "couleur-vert-pomme": "#BFF23D",
  "couleur-rose-fuchsia": "#e64291",
  "couleur-doree": "#f2bf46",
  "couleur-arc-en-ciel": "#ed5b91",
};

export const FONDS_BIBIT = {
  "fond-classique": "radial-gradient(ellipse at center, rgba(188, 164, 244, .18), rgba(10, 22, 49, .85) 70%)",
  "fond-rose": "radial-gradient(ellipse at center, #ffe0eb, #e875a2 70%)",
  "fond-bleu-ciel": "radial-gradient(ellipse at center, #f0fbff, #b8e3f7 70%)",
  "fond-menthe": "radial-gradient(ellipse at center, #f0fff2, #b9e3c3 70%)",
  "fond-lavande": "radial-gradient(ellipse at center, #faf6ff, #d2c0f0 70%)",
  "fond-vanille": "radial-gradient(ellipse at center, #fffdf2, #f2e3ae 70%)",
};

export const ARTICLES_BIBIT = [
  { id: "couleur-rose-fuchsia", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Rose fuchsia", description: "Un rose vif plein d’énergie.", prix: 5, couleur: "#e64291" },
  { id: "couleur-corail", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Corail", description: "Une teinte chaude et pétillante.", prix: 5, couleur: "#ff9878" },
  { id: "couleur-peche", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Pêche", description: "Un rose orangé tendre et lumineux.", prix: 5, couleur: "#ffc5a1" },
  { id: "couleur-abricot", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Abricot", description: "Un orange doux et ensoleillé.", prix: 5, couleur: "#f4a261" },
  { id: "couleur-jaune", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Jaune soleil", description: "Un jaune joyeux qui illumine le Bibit.", prix: 5, couleur: "#ffda69" },
  { id: "couleur-jaune-pika", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Jaune Pika", description: "Un jaune vif et lumineux.", prix: 5, couleur: "#fddd16" },
  { id: "couleur-vanille-madagascar", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Vanille de Madagascar", description: "Une teinte vanillée, chaude et délicate.", prix: 5, couleur: "#f3e5b3" },
  { id: "couleur-vert-pomme", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Vert pomme", description: "Un vert frais et pétillant.", prix: 5, couleur: "#BFF23D" },
  { id: "couleur-menthe", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Vert menthe", description: "Un vert tendre et apaisant.", prix: 5, couleur: "#8bd9ae" },
  { id: "couleur-vert-emeraude", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Vert émeraude", description: "Un vert précieux et éclatant.", prix: 5, couleur: "#3eaa75" },
  { id: "couleur-turquoise", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Turquoise", description: "Une teinte fraîche et lumineuse.", prix: 5, couleur: "#70d7cf" },
  { id: "couleur-baby-blue", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Baby blue", description: "Un bleu pastel frais et léger.", prix: 5, couleur: "#A2EFFE" },
  { id: "couleur-bleu-ciel", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Bleu ciel", description: "Un bleu clair plein de douceur.", prix: 5, couleur: "#267BF1" },
  { id: "couleur-bleu-nuit", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Bleu nuit", description: "Un bleu profond et mystérieux.", prix: 5, couleur: "#26334f" },
  { id: "couleur-violet", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Violet", description: "Une couleur douce aux reflets rêveurs.", prix: 5, couleur: "#9810FA" },
  { id: "couleur-lavande", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Lavande", description: "Un violet pastel plein de douceur.", prix: 5, couleur: "#b7a1d8" },
  { id: "couleur-chocolat-lait", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Chocolat au lait", description: "Un brun gourmand et réconfortant.", prix: 5, couleur: "#795548" },
  { id: "couleur-chocolat-noir", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Chocolat noir", description: "Un brun intense et profond.", prix: 5, couleur: "#4E342E" },
  { id: "couleur-gris-souris", categorie: "couleur", sousCategorie: "unie", emplacement: "couleur", nom: "Gris souris", description: "Un gris doux et tout en discrétion.", prix: 5, couleur: "#9b9ba0" },
  { id: "couleur-doree", categorie: "couleur", sousCategorie: "special", emplacement: "couleur", nom: "Or scintillant", description: "Une robe dorée qui capte la lumière.", prix: 10, couleur: "#f2bf46" },
  { id: "couleur-arc-en-ciel", categorie: "couleur", sousCategorie: "special", emplacement: "couleur", nom: "Arc-en-ciel", description: "Un dégradé multicolore, lumineux et joyeux.", prix: 15, couleur: "#ed5b91" },
  { id: "fond-rose", categorie: "fond", sousCategorie: "unie", emplacement: "fond", nom: "Rose Barbapapa", description: "Un dégradé rose tendre et gourmand autour de ton Bibit.", prix: 5 },
  { id: "fond-bleu-ciel", categorie: "fond", sousCategorie: "unie", emplacement: "fond", nom: "Ciel doux", description: "Un dégradé bleu clair et profond comme un ciel de printemps.", prix: 5 },
  { id: "fond-menthe", categorie: "fond", sousCategorie: "unie", emplacement: "fond", nom: "Jardin menthe", description: "Un dégradé vert frais et apaisant autour de ton Bibit.", prix: 5 },
  { id: "fond-lavande", categorie: "fond", sousCategorie: "unie", emplacement: "fond", nom: "Nuage lavande", description: "Un dégradé violet doux et rêveur autour de ton Bibit.", prix: 5 },
  { id: "fond-vanille", categorie: "fond", sousCategorie: "unie", emplacement: "fond", nom: "Crème vanillée", description: "Un dégradé jaune doux et chaleureux autour de ton Bibit.", prix: 5 },
  { id: "yeux-ronds", categorie: "corps", sousCategorie: "yeux", emplacement: "yeux", nom: "Yeux ronds", description: "De grands yeux bien ouverts.", prix: 10 },
  { id: "yeux-coeurs", categorie: "corps", sousCategorie: "yeux", emplacement: "yeux", nom: "Yeux cœurs", description: "Un regard plein de tendresse.", prix: 10 },
  { id: "yeux-spirales", categorie: "corps", sousCategorie: "yeux", emplacement: "yeux", nom: "Yeux spirales", description: "Un regard un peu étourdi.", prix: 20, disponible: false },
  { id: "accessoire-noeud", categorie: "habibits", sousCategorie: "chapeaux", emplacement: "accessoire", nom: "Petit nœud", description: "Un joli nœud posé sur la tête.", prix: 5, disponible: false },
  { id: "accessoire-frangipanier", categorie: "habibits", sousCategorie: "chapeaux", emplacement: "accessoire", nom: "Fleur de frangipanier", description: "Une fleur blanche et jaune à porter sur la tête.", prix: 10 },
  { id: "accessoire-couronne-royale", categorie: "habibits", sousCategorie: "chapeaux", emplacement: "accessoire", nom: "Couronne royale", description: "Une couronne dorée sertie de rubis, digne de la royauté.", prix: 15 },
  { id: "habit-pull", categorie: "habibits", sousCategorie: "vetements", emplacement: "habit", nom: "Pull", description: "Un pull tout doux et bien chaud.", prix: 5, disponible: false },
  { id: "habit-cape", categorie: "habibits", sousCategorie: "vetements", emplacement: "habit", nom: "Cape", description: "Une cape prête pour l’aventure.", prix: 10, disponible: false },
  { id: "habit-salopette", categorie: "habibits", sousCategorie: "vetements", emplacement: "habit", nom: "Salopette", description: "Une salopette confortable avec une poche.", prix: 20, disponible: false },
];

export const ETAT_BIBIT_INITIAL = {
  achats: [],
  equipe: {
    couleur: OPTIONS_BASE_BIBIT.couleur.id,
    yeux: OPTIONS_BASE_BIBIT.yeux.id,
    joues: OPTIONS_BASE_BIBIT.joues.id,
    bouche: OPTIONS_BASE_BIBIT.bouche.id,
    oreilles: OPTIONS_BASE_BIBIT.oreilles.id,
    dos: OPTIONS_BASE_BIBIT.dos.id,
    pieds: OPTIONS_BASE_BIBIT.pieds.id,
    accessoire: OPTIONS_BASE_BIBIT.accessoire.id,
    habit: OPTIONS_BASE_BIBIT.habit.id,
    fond: OPTIONS_BASE_BIBIT.fond.id,
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
  Object.entries(OPTIONS_BASE_BIBIT).forEach(([emplacement, optionBase]) => {
    const choixEnregistre = emplacement === "yeux"
      ? valeur?.equipe?.yeux ?? valeur?.equipe?.corps
      : valeur?.equipe?.[emplacement];
    const choisi = emplacement === "fond" && choixEnregistre === "aucun"
      ? optionBase.id
      : choixEnregistre;
    const articleEquipe = articlesParId.get(choisi);
    equipe[emplacement] = choisi === optionBase.id ||
      choisi === OPTIONS_AUCUN_BIBIT[emplacement]?.id ||
      (articleEquipe?.emplacement === emplacement && articlesPossedes.has(articleEquipe.id))
      ? choisi
      : optionBase.id;
  });
  return { achats, equipe };
}
