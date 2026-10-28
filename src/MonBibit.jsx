import { useState } from "react";
import BibitIllustration from "./BibitIllustration";
import {
  ARTICLES_BIBIT,
  CATEGORIES_BIBIT,
  OPTIONS_BASE_BIBIT,
} from "./data/bibitBoutique";

export default function MonBibit({ bibit, erreur, onAllerShop, onEquiper }) {
  const [categorieActive, setCategorieActive] = useState("couleur");
  const categorie = CATEGORIES_BIBIT.find((item) => item.id === categorieActive);
  const options = [
    OPTIONS_BASE_BIBIT[categorieActive],
    ...ARTICLES_BIBIT.filter((article) =>
      article.categorie === categorieActive && bibit.achats.some((achat) => achat.articleId === article.id)
    ),
  ];

  return (
    <section className="page-bibit" aria-labelledby="titre-bibit">
      <div className="entete-bibit">
        <div>
          <h2 id="titre-bibit" className="jour-titre">Mon Bibit</h2>
          <p>Choisis son look avec les personnalisations que tu as débloquées.</p>
        </div>
        <button className="btn petit bouton-shop" onClick={onAllerShop}>🛍️ SHOSHOP</button>
      </div>

      <div className="tuile scene-bibit">
        <BibitIllustration apparence={bibit.equipe} />
      </div>

      <div className="onglets-bibit" role="tablist" aria-label="Catégories de personnalisation">
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
      <section role="tabpanel" aria-label={`Options : ${categorie.nom.toLocaleLowerCase("fr")}`}>
        <h3 className="titre-options-bibit">{categorie.nom}</h3>
        {categorie.aVenir && <p className="bibit-avenir">A VENIR</p>}
        {(!categorie.aVenir || options.length > 1) && (
          <div className="options-bibit">
            {options.map((option) => (
              <button
                key={option.id}
                className={`option-bibit ${bibit.equipe[categorieActive] === option.id ? "selectionne" : ""}`}
                aria-pressed={bibit.equipe[categorieActive] === option.id}
                onClick={() => onEquiper(categorieActive, option.id)}
              >
                {categorieActive === "couleur" && (
                  <span className="pastille-bibit" style={{ "--couleur-bibit": option.couleur }} aria-hidden="true" />
                )}
                <span>{option.nom}</span>
              </button>
            ))}
          </div>
        )}
        {!categorie.aVenir && options.length === 1 && <p className="note">D’autres options seront disponibles après leur achat dans SHOSHOP.</p>}
      </section>
      {erreur && <p className="attention" role="alert">{erreur}</p>}
    </section>
  );
}
