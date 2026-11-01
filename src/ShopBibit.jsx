import { useState } from "react";
import BibitIllustration from "./BibitIllustration";
import {
  ARTICLES_BIBIT,
  CATEGORIES_BIBIT,
  ETAT_BIBIT_INITIAL,
  FONDS_BIBIT,
} from "./data/bibitBoutique";

function apparenceArticle(article, apparence) {
  return { ...apparence, [article.emplacement]: article.id };
}

export default function ShopBibit({ bibit, soldePommes, erreur, achatEnCours, onRetour, onAcheter }) {
  const [categorieActive, setCategorieActive] = useState("couleur");
  const [sousCategorieActive, setSousCategorieActive] = useState("unie");
  const articlesPossedes = new Set(bibit.achats.map((achat) => achat.articleId));
  const categorie = CATEGORIES_BIBIT.find((item) => item.id === categorieActive);
  const sousCategorie = categorie.sousCategories.find((item) => item.id === sousCategorieActive);
  const articlesSousCategorie = ARTICLES_BIBIT.filter((article) =>
    article.categorie === categorieActive && article.sousCategorie === sousCategorie.id
  );
  const articlesDisponibles = articlesSousCategorie.filter((article) => article.disponible !== false);
  const articles = articlesDisponibles.filter((article) => !articlesPossedes.has(article.id));

  return (
    <section className="page-shop" aria-labelledby="titre-shop">
      <div className="entete-shop">
        <div>
          <button className="btn petit bouton-shop bouton-retour-bibit" onClick={onRetour}>✨ Mon Bibit</button>
          <h2 id="titre-shop" className="jour-titre">Le Shop</h2>
        </div>
        <div className="solde-shop" aria-label={`Mes popommes : ${soldePommes}`}>
          <span className="libelle-solde-shop">Mes popommes</span>
          <span aria-hidden="true">🍎</span>
          <strong>{soldePommes}</strong>
        </div>
      </div>
      {soldePommes < 0 && <p className="note solde-negatif">Ton solde de pommes est négatif. Gagne des pommes pour le faire remonter avant de nouveaux achats.</p>}
      <p className="intro-shop">Achète une personnalisation pour la débloquer définitivement. Tu pourras l’équiper ou la retirer dans Mon Bibit.</p>

      <div className="onglets-bibit" role="tablist" aria-label="Catégories du Shop">
        {CATEGORIES_BIBIT.map((item) => (
          <button
            key={item.id}
            className={`btn petit ${categorieActive === item.id ? "actif" : "discret"}`}
            role="tab"
            aria-selected={categorieActive === item.id}
            onClick={() => {
              setCategorieActive(item.id);
              setSousCategorieActive(item.sousCategories[0].id);
            }}
          >
            {item.nom}
          </button>
        ))}
      </div>
      <div
        className="sous-onglets-bibit"
        role="tablist"
        aria-label={`Sous-catégories ${categorie.nom.toLocaleLowerCase("fr")}`}
        style={{ "--colonnes-sous-onglets": Math.min(3, categorie.sousCategories.length) }}
      >
        {categorie.sousCategories.map((item) => (
          <button
            key={item.id}
            className={`btn petit ${sousCategorieActive === item.id ? "actif" : "discret"}`}
            role="tab"
            aria-selected={sousCategorieActive === item.id}
            onClick={() => setSousCategorieActive(item.id)}
          >
            {item.nom}
            {item.emoji && <span aria-hidden="true"> {item.emoji}</span>}
          </button>
        ))}
      </div>
      <section role="tabpanel" aria-label={`Articles : ${sousCategorie.nom.toLocaleLowerCase("fr")}`}>
        {articlesDisponibles.length === 0 ? (
          <div className="tuile shop-avenir"><h3>A VENIR</h3></div>
        ) : articles.length === 0 ? (
          <div className="tuile">
            <h3>Tout est débloqué !</h3>
            <p>Tu as acheté toutes les options de cette sous-catégorie.</p>
          </div>
        ) : (
          <div className="articles-shop">
            {articles.map((article) => {
              const achatPossible = soldePommes >= article.prix && !achatEnCours;
              return (
                <article className="article-shop" key={article.id}>
                  <div
                    className="article-shop-apercu"
                    style={{
                      background: article.emplacement === "fond"
                        ? FONDS_BIBIT[article.id]
                        : FONDS_BIBIT["fond-classique"],
                    }}
                  >
                    <BibitIllustration
                      className="illustration-article"
                      apparence={apparenceArticle(article, bibit.equipe || ETAT_BIBIT_INITIAL.equipe)}
                      decorative
                      canvasEtendue
                    />
                  </div>
                  <div className="tuile article-shop-contenu">
                    <h3>{article.nom}</h3>
                    <p>{article.description}</p>
                    <p className="prix-shop">Prix : <strong>{article.prix} 🍎</strong></p>
                    <button
                      className="btn petit"
                      disabled={!achatPossible}
                      onClick={() => onAcheter(article.id)}
                    >
                      {achatEnCours ? "Achat en cours…" : soldePommes < article.prix ? "Pas assez de popommes" : "Acheter"}
                    </button>
                    {soldePommes < article.prix && (
                      <small className="reste-shop">
                        Il te manque {article.prix - soldePommes} popommes.
                      </small>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      {erreur && <p className="attention" role="alert">{erreur}</p>}
    </section>
  );
}
