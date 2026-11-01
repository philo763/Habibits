import { useState } from "react";
import BibitIllustration from "./BibitIllustration";
import {
  ARTICLES_BIBIT,
  CATEGORIES_BIBIT,
  FONDS_BIBIT,
  OPTIONS_AUCUN_BIBIT,
  OPTIONS_BASE_BIBIT,
} from "./data/bibitBoutique";

export default function MonBibit({ bibit, erreur, onAllerShop, onEquiper }) {
  const [categorieActive, setCategorieActive] = useState("couleur");
  const categorie = CATEGORIES_BIBIT.find((item) => item.id === categorieActive);
  const [sousCategorieActive, setSousCategorieActive] = useState("unie");
  const sousCategorie = categorie.sousCategories.find((item) => item.id === sousCategorieActive);
  const articlesSousCategorie = ARTICLES_BIBIT.filter((article) =>
    article.categorie === categorieActive && article.sousCategorie === sousCategorie.id
  );
  const optionBase = sousCategorie.optionBase ? OPTIONS_BASE_BIBIT[sousCategorie.emplacement] : null;
  const options = [
    ...(optionBase ? [optionBase] : []),
    ...(OPTIONS_AUCUN_BIBIT[sousCategorie.emplacement]
      ? [OPTIONS_AUCUN_BIBIT[sousCategorie.emplacement]]
      : []),
    ...articlesSousCategorie.filter((article) =>
      bibit.achats.some((achat) => achat.articleId === article.id)
    ),
  ];

  return (
    <section className="page-bibit" aria-labelledby="titre-bibit">
      <div className="entete-bibit">
        <div>
          <h2 id="titre-bibit" className="jour-titre">Mon Bibit</h2>
          <p>Choisis son look avec les personnalisations que tu as débloquées.</p>
        </div>
        <button className="btn petit bouton-shop" onClick={onAllerShop}>🛍️ Le Shop</button>
      </div>

      <div
        className="tuile scene-bibit"
        style={{ background: FONDS_BIBIT[bibit.equipe.fond] || FONDS_BIBIT["fond-classique"] }}
      >
        <BibitIllustration
          apparence={bibit.equipe}
          canvasEtendue
        />
      </div>

      <div className="onglets-bibit" role="tablist" aria-label="Catégories de personnalisation">
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
      <section role="tabpanel" aria-label={`Options : ${sousCategorie.nom.toLocaleLowerCase("fr")}`}>
        <h3 className="titre-options-bibit">{sousCategorie.nom}</h3>
        {options.length > 0 ? (
          <div className="options-bibit">
            {options.map((option) => (
              <button
                key={option.id}
                className={`option-bibit ${bibit.equipe[sousCategorie.emplacement] === option.id ? "selectionne" : ""}`}
                aria-pressed={bibit.equipe[sousCategorie.emplacement] === option.id}
                onClick={() => onEquiper(sousCategorie.emplacement, option.id)}
              >
                {["couleur", "fond"].includes(sousCategorie.emplacement) && (
                  <span
                    className={`pastille-bibit ${sousCategorie.emplacement === "fond" ? "pastille-fond-bibit" : ""}`}
                    style={{ "--couleur-bibit": option.couleur || FONDS_BIBIT[option.id] }}
                    aria-hidden="true"
                  />
                )}
                <span>{option.nom}</span>
              </button>
            ))}
          </div>
        ) : articlesSousCategorie.length === 0 ? (
          <p className="bibit-avenir">A VENIR</p>
        ) : (
          <p className="note">D’autres options seront disponibles après leur achat dans Le Shop.</p>
        )}
      </section>
      {erreur && <p className="attention" role="alert">{erreur}</p>}
    </section>
  );
}
