import { useState } from "react";
import BibitIllustration from "./BibitIllustration";
import {
  ARTICLES_BIBIT,
  CATEGORIES_BIBIT,
  ETAT_BIBIT_INITIAL,
} from "./data/bibitBoutique";

function apparenceArticle(article, apparence) {
  return { ...apparence, [article.categorie]: article.id };
}

export default function ShopBibit({ bibit, solde, erreur, achatEnCours, onRetour, onAcheter }) {
  const [categorieActive, setCategorieActive] = useState("couleur");
  const articlesPossedes = new Set(bibit.achats.map((achat) => achat.articleId));
  const articles = ARTICLES_BIBIT.filter((article) =>
    article.categorie === categorieActive && article.disponible !== false && !articlesPossedes.has(article.id)
  );
  const categorie = CATEGORIES_BIBIT.find((item) => item.id === categorieActive);

  return (
    <section className="page-shop" aria-labelledby="titre-shop">
      <div className="entete-shop">
        <div>
          <button className="btn petit bouton-shop bouton-retour-bibit" onClick={onRetour}>✨ Mon Bibit</button>
          <h2 id="titre-shop" className="jour-titre">SHOSHOP</h2>
        </div>
        <div className="solde-shop" aria-label={`Solde disponible : ${solde} cacas`}>
          <span aria-hidden="true">💩</span>
          <strong>{solde}</strong>
          <span>disponibles</span>
        </div>
      </div>
      {solde < 0 && <p className="note solde-negatif">Ton solde est négatif. Gagne des 💩 pour le faire remonter avant de nouveaux achats.</p>}
      <p className="intro-shop">Achète une personnalisation pour la débloquer définitivement. Tu pourras l’équiper ou la retirer dans Mon Bibit.</p>

      <div className="onglets-bibit" role="tablist" aria-label="Catégories du Shop">
        {CATEGORIES_BIBIT.map((item) => (
          <button
            key={item.id}
            className={`btn petit ${categorieActive === item.id ? "actif" : "discret"}`}
            role="tab"
            aria-selected={categorieActive === item.id}
            onClick={() => setCategorieActive(item.id)}
          >
            {item.nom}
          </button>
        ))}
      </div>
      <section role="tabpanel" aria-label={`Articles : ${categorie.nom.toLocaleLowerCase("fr")}`}>
        {categorie.aVenir ? (
          <div className="tuile shop-avenir"><h3>A VENIR</h3></div>
        ) : articles.length === 0 ? (
          <div className="tuile">
            <h3>Tout est débloqué !</h3>
            <p>Tu as acheté toutes les options de cette catégorie.</p>
          </div>
        ) : (
          <div className="articles-shop">
            {articles.map((article) => {
              const achatPossible = solde >= article.prix && !achatEnCours;
              return (
                <article className="tuile article-shop" key={article.id}>
                  <BibitIllustration
                    className="illustration-article"
                    apparence={apparenceArticle(article, bibit.equipe || ETAT_BIBIT_INITIAL.equipe)}
                    decorative
                  />
                  <div className="article-shop-contenu">
                    <h3>{article.nom}</h3>
                    <p>{article.description}</p>
                    <p className="prix-shop">Prix : <strong>💩 {article.prix}</strong></p>
                    <button
                      className="btn petit"
                      disabled={!achatPossible}
                      onClick={() => onAcheter(article.id)}
                    >
                      {achatEnCours ? "Achat en cours…" : solde < article.prix ? "Solde insuffisant" : "Acheter"}
                    </button>
                    {solde < article.prix && (
                      <small className="reste-shop">Il te manque {article.prix - solde} 💩.</small>
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
