import { useId } from "react";
import { COULEURS_BIBIT } from "./data/bibitBoutique";

export default function BibitIllustration({ apparence, className = "", decorative = false }) {
  const idGradient = `bibit-couleur-${useId().replace(/:/g, "")}`;
  const couleurPersonnalisee = ["couleur-doree", "couleur-arc-en-ciel"].includes(apparence?.couleur);
  const couleur = couleurPersonnalisee ? `url(#${idGradient})` :
    COULEURS_BIBIT[apparence?.couleur] || COULEURS_BIBIT.rose;
  const ariaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": "Illustration du Bibit personnalisé" };

  return (
    <svg
      className={`illustration-bibit ${className}`}
      viewBox="0 0 240 240"
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
          ) : (
            <linearGradient id={idGradient} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff66b3" />
              <stop offset="22%" stopColor="#f53c91" />
              <stop offset="42%" stopColor="#f6a844" />
              <stop offset="60%" stopColor="#f4df58" />
              <stop offset="75%" stopColor="#62c98b" />
              <stop offset="88%" stopColor="#55bde8" />
              <stop offset="100%" stopColor="#9b72dc" />
            </linearGradient>
          )}
        </defs>
      )}
      <ellipse cx="120" cy="214" rx="57" ry="10" fill="#071127" opacity=".55" />
      <g fill={couleur} stroke="#57385f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
        <path d="M75 82C56 64 58 38 68 29c15 2 28 20 31 43M165 82c19-18 17-44 7-53-15 2-28 20-31 43" />
        <path d="M66 142c-17 1-25 16-20 27 5 10 18 10 29 0M174 142c17 1 25 16 20 27-5 10-18 10-29 0" />
      </g>
      <path d="M120 59c-42 0-69 31-69 77 0 43 29 69 69 69s69-26 69-69c0-46-27-77-69-77Z" fill={couleur} stroke="#57385f" strokeLinejoin="round" strokeWidth="5" />
      {apparence?.couleur === "couleur-doree" && (
        <g fill="#fff8d8" opacity=".8" aria-hidden="true">
          <path d="m166 82 2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" />
          <path d="m75 167 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
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

      <g fill="#ed8eaf" opacity=".8">
        <ellipse cx="83" cy="145" rx="12" ry="7" />
        <ellipse cx="157" cy="145" rx="12" ry="7" />
      </g>

      {apparence?.corps === "yeux-ronds" ? (
        <g>
          <circle cx="96" cy="119" r="10" fill="#fff" />
          <circle cx="144" cy="119" r="10" fill="#fff" />
          <circle cx="98" cy="120" r="5" fill="#302744" />
          <circle cx="146" cy="120" r="5" fill="#302744" />
        </g>
      ) : apparence?.corps === "yeux-coeurs" ? (
        <g fill="#d94f73">
          <path d="M96 128 86 119c-8-8 4-18 10-9 6-9 18 1 10 9Z" />
          <path d="m144 128-10-9c-8-8 4-18 10-9 6-9 18 1 10 9Z" />
        </g>
      ) : apparence?.corps === "yeux-spirales" ? (
        <g fill="none" stroke="#302744" strokeLinecap="round" strokeWidth="4">
          <path d="M101 117c0-7-10-7-10 0s10 7 10 0 9-6 9 1" />
          <path d="M149 117c0-7-10-7-10 0s10 7 10 0 9-6 9 1" />
        </g>
      ) : (
        <g fill="#302744">
          <ellipse cx="96" cy="119" rx="6" ry="9" />
          <ellipse cx="144" cy="119" rx="6" ry="9" />
          <circle cx="98" cy="116" r="2" fill="#fff" />
          <circle cx="146" cy="116" r="2" fill="#fff" />
        </g>
      )}

      <path d="M109 139c6 8 16 8 22 0" fill="none" stroke="#57385f" strokeLinecap="round" strokeWidth="4" />
      {apparence?.accessoire === "accessoire-noeud" && (
        <g fill="#f28aa8" stroke="#57385f" strokeLinejoin="round" strokeWidth="3">
          <path d="m111 69-18-11 2 22ZM129 69l18-11-2 22Z" />
          <circle cx="120" cy="69" r="6" fill="#ffd46c" />
        </g>
      )}
      {apparence?.accessoire === "accessoire-fleur" && (
        <g stroke="#57385f" strokeWidth="2">
          <circle cx="152" cy="65" r="8" fill="#ff8fa3" />
          <circle cx="160" cy="72" r="8" fill="#ff8fa3" />
          <circle cx="152" cy="80" r="8" fill="#ff8fa3" />
          <circle cx="144" cy="72" r="8" fill="#ff8fa3" />
          <circle cx="152" cy="72" r="5" fill="#ffd46c" />
        </g>
      )}
      {apparence?.accessoire === "accessoire-couronne" && (
        <path d="m91 65 5-18 13 12 11-20 11 20 13-12 5 18Z" fill="#ffd46c" stroke="#57385f" strokeLinejoin="round" strokeWidth="4" />
      )}
      <g fill={couleur} stroke="#57385f" strokeLinecap="round" strokeWidth="5">
        <path d="M88 195v8M152 195v8" />
      </g>
    </svg>
  );
}
