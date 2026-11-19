import IndicateurDifficulte from "./IndicateurDifficulte";

// Une case du calendrier. Utilisée par le calendrier (bouton cliquable) et par les règles
// (illustration), pour que les deux aient toujours le même aspect.
export default function CaseCalendrier({
  element: Element = "button",
  etat = "vide",
  couleur,
  numero,
  portes = {},
  etoile = false,
  difficulte,
  note = false,
  lotus = false,
  attente = false,
  de = false,
  className = "",
  ...reste
}) {
  const classes = [
    "case",
    etat,
    portes.gauche ? "porte-gauche" : "",
    portes.droite ? "porte-droite" : "",
    portes.haut || portes.bas ? "porte-verticale" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Element className={classes} style={couleur ? { "--couleur": couleur } : undefined} {...reste}>
      {portes.haut && <span className="porte porte-haut" aria-hidden="true" />}
      {portes.bas && <span className="porte porte-bas" aria-hidden="true" />}
      {numero !== undefined && <span className="num">{numero}</span>}
      {etat === "fait" && etoile && (
        <span className="coche" role="img" aria-label="Défi du moment">⭐</span>
      )}
      {etat === "fait" && (
        <span className="case-indicateur indicateur-difficulte-case">
          <IndicateurDifficulte difficulte={difficulte} />
        </span>
      )}
      {etat === "non-reussi" && (
        <span className="case-indicateur" role="img" aria-label={note ? "Défi raté, avec une note" : "Défi raté"}>{note ? "📝" : "×"}</span>
      )}
      {lotus && (
        <span className="case-indicateur" role="img" aria-label="Jour de repos">🪷</span>
      )}
      {attente && (
        <span className="case-indicateur" role="img" aria-label="Défis tirés, choix en attente">🤔</span>
      )}
      {de && (
        <span className="case-indicateur de-a-quatre" role="img" aria-label="Tirer des défis">🎲</span>
      )}
    </Element>
  );
}
