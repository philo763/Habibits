const NOMBRE_BARRES = {
  facile: 1,
  moyen: 2,
  difficile: 3,
};

export default function IndicateurDifficulte({ difficulte, decoratif = false }) {
  const nombreBarres = NOMBRE_BARRES[difficulte] || 0;

  return (
    <span
      className="indicateur-difficulte"
      role={decoratif ? undefined : "img"}
      aria-label={decoratif ? undefined : `Difficulté ${difficulte}`}
      aria-hidden={decoratif ? "true" : undefined}
    >
      {[1, 2, 3].map((barre) => (
        <span key={barre} className={`indicateur-difficulte-barre ${barre <= nombreBarres ? "active" : ""}`} />
      ))}
    </span>
  );
}
