import { useId } from "react";
import { COULEURS_BIBIT } from "./data/bibitBoutique";

export default function BibitIllustration({ apparence, className = "", decorative = false, canvasEtendue = false }) {
  const idGradient = `bibit-couleur-${useId().replace(/:/g, "")}`;
  const couleurPersonnalisee = ["couleur-doree", "couleur-arc-en-ciel", "couleur-caca"].includes(apparence?.couleur);
  const couleur = couleurPersonnalisee ? `url(#${idGradient})` :
    COULEURS_BIBIT[apparence?.couleur] || COULEURS_BIBIT.rose;
  const ariaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": "Illustration du Bibit personnalisé" };

  return (
    <svg
      className={`illustration-bibit ${className}`}
      viewBox={canvasEtendue ? "-72 -72 384 384" : "0 0 240 240"}
      xmlns="http://www.w3.org/2000/svg"
      {...ariaProps}
    >
      {couleurPersonnalisee && (
        <defs>
          {apparence.couleur === "couleur-doree" ? (
            <linearGradient id={idGradient} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff3ac" />
              <stop offset="32%" stopColor="#ffd85f" />
              <stop offset="58%" stopColor="#f2bf46" />
              <stop offset="82%" stopColor="#ffe99a" />
              <stop offset="100%" stopColor="#cf8b20" />
            </linearGradient>
          ) : apparence.couleur === "couleur-arc-en-ciel" ? (
            <linearGradient id={idGradient} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff66b3" />
              <stop offset="22%" stopColor="#f53c91" />
              <stop offset="42%" stopColor="#f6a844" />
              <stop offset="60%" stopColor="#f4df58" />
              <stop offset="75%" stopColor="#62c98b" />
              <stop offset="88%" stopColor="#55bde8" />
              <stop offset="100%" stopColor="#9b72dc" />
            </linearGradient>
          ) : (
            <>
              <linearGradient id={idGradient} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B98254" />
                <stop offset="34%" stopColor="#9B613A" />
                <stop offset="72%" stopColor="#754326" />
                <stop offset="100%" stopColor="#56311F" />
              </linearGradient>
              <clipPath id={`${idGradient}-body`}>
                <path d="M120 59c-42 0-69 31-69 77 0 43 29 69 69 69s69-26 69-69c0-46-27-77-69-77Z" />
              </clipPath>
            </>
          )}
        </defs>
      )}
      <ellipse cx="120" cy="214" rx="57" ry="10" fill="#071127" opacity=".55" />
      {apparence?.queue === "queue-pika" && (
        <g transform="translate(238 108) scale(.55 .55) translate(-120 -120)">
          <path
            transform="rotate(25 120 120)"
            d="M148.6 13.2 L174 96.2 L105.6 140.2 L115.5 189.4 L82.4 207 L93 240 L75.4 234.4 L57.7 202.8 L83.8 176.6 L48.6 108.9 L148.6 13.2 Z"
            fill={couleur}
            stroke="none"
          />
          <path
            transform="rotate(25 120 120)"
            d="M82.4 207 L93 240 L75.4 234.4 L73 229 Z"
            fill="#57385f"
            stroke="none"
          />
          <path
            transform="rotate(25 120 120)"
            d="M148.6 13.2 L174 96.2 L105.6 140.2 L115.5 189.4 L82.4 207 L93 240 L75.4 234.4 L57.7 202.8 L83.8 176.6 L48.6 108.9 L148.6 13.2 Z"
            fill="none"
            stroke="#57385f"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      {apparence?.oreilles === "oreilles-pika" ? (
        <>
          <g transform="translate(0 -41) scale(1 1.5)">
            <path
              d="M75 82C56 64 58 38 68 29c15 2 28 20 31 43Z"
              fill={couleur}
              stroke="#57385f"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            <path d="M68 29C64 33 62 37 62 40L80 37C77 33 72 30 68 29Z" fill="#57385f" />
          </g>
          <g transform="rotate(38 153 78) translate(240 -41) scale(-1 1.5)">
            <path
              d="M75 82C56 64 58 38 68 29c15 2 28 20 31 43Z"
              fill={couleur}
              stroke="#57385f"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            <path d="M68 29C64 33 62 37 62 40L80 37C77 33 72 30 68 29Z" fill="#57385f" />
          </g>
        </>
      ) : apparence?.oreilles !== "aucun" && (
        <path
          d="M75 82C56 64 58 38 68 29c15 2 28 20 31 43M165 82c19-18 17-44 7-53-15 2-28 20-31 43"
          fill={couleur}
          stroke="#57385f"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
      )}
      {apparence?.bras !== "aucun" && (
        <path
          d="M66 142c-17 1-25 16-20 27 5 10 18 10 29 0M174 142c17 1 25 16 20 27-5 10-18 10-29 0"
          fill={couleur}
          stroke="#57385f"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
      )}
      <path d="M120 59c-42 0-69 31-69 77 0 43 29 69 69 69s69-26 69-69c0-46-27-77-69-77Z" fill={couleur} stroke="#57385f" strokeLinejoin="round" strokeWidth="5" />
      {apparence?.couleur === "couleur-caca" && (
        <g clipPath={`url(#${idGradient}-body)`} aria-hidden="true">
          <g fill="none" stroke="#56351F" strokeLinecap="round" strokeOpacity=".42">
            <path d="m85 83 4-3m30-12 4 2m31 16 4 3m-92 35 5-3m34 7 5-4m42 7 4 2m-65 39 4-3m34 12 3-4m34-32 5-3m-77-56 3-3m42 89 4-2" strokeWidth="2"/>
          </g>
          <g fill="none" stroke="#E5B17C" strokeLinecap="round" strokeOpacity=".5">
            <path d="m94 78 4-2m41 4 4 2m-65 34 4-3m39 12 4 2m37 39 4-3m-75 21 4 1m44-20 4-2" strokeWidth="2"/>
          </g>
          <g fill="#4B2D1C" opacity=".34">
            <circle cx="106" cy="78" r="1.3"/>
            <circle cx="158" cy="97" r="1.2"/>
            <circle cx="88" cy="125" r="1.4"/>
            <circle cx="136" cy="113" r="1.2"/>
            <circle cx="166" cy="155" r="1.5"/>
            <circle cx="102" cy="172" r="1.2"/>
            <circle cx="148" cy="184" r="1.4"/>
          </g>
        </g>
      )}
      {apparence?.couleur === "couleur-caca" && (
        <g fill="none" strokeLinecap="round" aria-hidden="true">
          <g stroke="#56351F" strokeOpacity=".5" strokeWidth="2">
            <path d="m68 43 4 3m-2 8 4-3m88-8 4 3m-3 9 4-3M48 151l4 2m8 10-3 3m140-15-4 2m-3 12 4 3"/>
          </g>
          <g stroke="#E5B17C" strokeOpacity=".55" strokeWidth="1.5">
            <path d="m76 48 3 2m84 5 3 2m-109 98 3 2m131-1 3 2"/>
          </g>
        </g>
      )}
      {apparence?.couleur === "couleur-doree" && (
        <g fill="#fff8d8" opacity=".8" aria-hidden="true">
          <path d="m166 82 2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" />
          <path d="m75 167 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
          <path d="m91 91 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
          <path d="m158 174 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
        </g>
      )}
      {["couleur-doree", "couleur-arc-en-ciel"].includes(apparence?.couleur) && (
        <g fill="#ffd85f" aria-hidden="true">
          <path d="m35 101 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
          <path d="m204 76 2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5Z" />
          <path d="m204 171 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        </g>
      )}

      {apparence?.habit === "habit-pull" && (
        <g>
          <path d="M62 154c27 15 89 15 116 0l10 35c-31 16-105 16-136 0Z" fill="#70a9e8" stroke="#57385f" strokeLinejoin="round" strokeWidth="4" />
          <path d="M105 159h30M108 169h24M111 179h18" stroke="#dcecff" strokeLinecap="round" strokeWidth="3" />
        </g>
      )}
      {apparence?.habit === "habit-cape" && (
        <g>
          <path d="M78 146c20 17 64 17 84 0l23 41c-19 15-39 21-65 21s-46-6-65-21Z" fill="#ad82e8" stroke="#57385f" strokeLinejoin="round" strokeWidth="4" />
          <path d="m93 153 27 17 27-17" fill="none" stroke="#f6d46f" strokeLinejoin="round" strokeWidth="4" />
        </g>
      )}
      {apparence?.habit === "habit-salopette" && (
        <g>
          <path d="M77 155h86l8 34c-29 15-73 15-102 0Z" fill="#72b5dc" stroke="#57385f" strokeLinejoin="round" strokeWidth="4" />
          <path d="m91 155 4-20h17l8 20 8-20h17l4 20" fill="none" stroke="#57385f" strokeLinejoin="round" strokeWidth="5" />
          <rect x="108" y="168" width="24" height="17" rx="4" fill="#f3d16d" stroke="#57385f" strokeWidth="3" />
        </g>
      )}

      {apparence?.joues === "joues-pika" ? (
        <g fill="#ee1b24" stroke="#57385f" strokeWidth="2">
          <circle cx="79.3" cy="145" r="12" />
          <circle cx="160.7" cy="145" r="12" />
        </g>
      ) : apparence?.joues !== "aucun" ? (
        <g fill="#ed8eaf" opacity=".8">
          <ellipse cx="83" cy="145" rx="12" ry="7" />
          <ellipse cx="157" cy="145" rx="12" ry="7" />
        </g>
      ) : null}

      {apparence?.yeux !== "aucun" && (
        (apparence?.yeux ?? apparence?.corps) === "yeux-ronds" ? (
          <g>
            <circle cx="96" cy="119" r="10" fill="#fff" />
            <circle cx="144" cy="119" r="10" fill="#fff" />
            <circle cx="98" cy="120" r="5" fill="#302744" />
            <circle cx="146" cy="120" r="5" fill="#302744" />
          </g>
        ) : (apparence?.yeux ?? apparence?.corps) === "yeux-coeurs" ? (
          <g fill="#d94f73">
            <path d="M96 128 86 119c-8-8 4-18 10-9 6-9 18 1 10 9Z" />
            <path d="m144 128-10-9c-8-8 4-18 10-9 6-9 18 1 10 9Z" />
          </g>
        ) : (apparence?.yeux ?? apparence?.corps) === "yeux-spirales" ? (
          <g fill="none" stroke="#302744" strokeLinecap="round" strokeWidth="4">
            <path d="M101 117c0-7-10-7-10 0s10 7 10 0 9-6 9 1" />
            <path d="M149 117c0-7-10-7-10 0s10 7 10 0 9-6 9 1" />
          </g>
        ) : (
          <g fill="#57385f">
            <ellipse cx="96" cy="119" rx="6" ry="9" />
            <ellipse cx="144" cy="119" rx="6" ry="9" />
            <circle cx="98" cy="116" r="2" fill="#fff" />
            <circle cx="146" cy="116" r="2" fill="#fff" />
          </g>
        )
      )}

      {apparence?.bouche === "bouche-pika-ouverte" ? (
        <svg x="106.8" y="133.295" width="26.4" height="20.46" viewBox="0 0 80 62" aria-hidden="true">
          <path
            d="M9 14 C19 19 28 15 37 5 C46 15 57 19 68 14 L65.5 25 C57 20 47 18 38 18 C28 18 19 20 11.5 25 Z"
            fill="#A71922"
          />
          <path
            d="M11.5 25 C19 20 28 18 32 18 C48 18 57 20 65.5 25 C62 36 54 50 45 56 C41 59 39 59 32 57 C23 52 15 37 11.5 25 Z"
            fill="#E8757D"
          />
          <path
            d="M3 5 C5 8 7 11 9 14 C19 19 28 15 37 5 C46 15 57 19 68 14 C70 11 72 8 73 7 M9 14 C11 29 19 47 29 55 C34 60 42 60 47 56 C58 47 65 29 68 14"
            fill="none"
            stroke="#57385F"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 25 C19 20 28 18 38 18 C48 18 57 20 65.5 25"
            fill="none"
            stroke="#57385F"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : apparence?.bouche === "bouche-ondulee" ? (
        <svg x="96" y="136.875" width="48" height="9.75" viewBox="0 0 22 6.5" aria-hidden="true">
          <path
            d="M 2,2.6 C 3.2,3.9 4.1,4.5 5.2,4.5 C 7.5,4.5 9.1,2.1 11,2.1 C 12.9,2.1 14.5,4.5 17.5,4.5 C 18.6,4.5 19.3,3.8 20,2.6"
            fill="none"
            stroke="#57385f"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      ) : apparence?.bouche !== "aucun" && (
        <path d="M109 139c6 8 16 8 22 0" fill="none" stroke="#57385f" strokeLinecap="round" strokeWidth="4" />
      )}
      {apparence?.accessoire === "accessoire-noeud" && (
        <g fill="#f28aa8" stroke="#57385f" strokeLinejoin="round" strokeWidth="3">
          <path d="m111 69-18-11 2 22ZM129 69l18-11-2 22Z" />
          <circle cx="120" cy="69" r="6" fill="#ffd46c" />
        </g>
      )}
      {apparence?.accessoire === "accessoire-frangipanier" && (
        <image href={`${import.meta.env.BASE_URL}fleur-frangipanier.svg`} x="0" y="0" width="240" height="240" />
      )}
      {apparence?.accessoire === "accessoire-couronne-royale" && (
        <image href={`${import.meta.env.BASE_URL}couronne-royale.svg`} x="0" y="0" width="240" height="240" />
      )}
      {apparence?.accessoire === "accessoire-crotte-spirale" && (
        <image href={`${import.meta.env.BASE_URL}chapeau-crotte-spirale.svg?v=1`} x="48" y="22" width="144" height="144" />
      )}
      {apparence?.pieds !== "aucun" && (
        <g fill={couleur} stroke="#57385f" strokeLinecap="round" strokeWidth="5">
          <path d="M88 195v8M152 195v8" />
        </g>
      )}
      {apparence?.couleur === "couleur-caca" && (
        <g fill="none" stroke="#7CBD55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M91 43c-6-5 5-9 0-15-3-4-1-8 2-11" strokeWidth="3.5" />
          <path d="M120 37c-5-5 5-9 0-15-3-4-2-8 1-12" strokeWidth="4" />
          <path d="M149 43c6-5-5-9 0-15 3-4 1-8-2-11" strokeWidth="3.5" />
        </g>
      )}
    </svg>
  );
}
