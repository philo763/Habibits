import { useState } from "react";
import Restauration from "./Restauration";
import { useSauvegarde, activerSauvegardeAuto, demanderPersistant } from "./sauvegarde";

const estInstallee = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const NB_ETAPES = 4;

export default function Accueil({ onTermine }) {
  const s = useSauvegarde();
  const [etape, setEtape] = useState(0);
  const [restauration, setRestauration] = useState(false);
  const [retourProtection, setRetourProtection] = useState("");
  const [retourFichier, setRetourFichier] = useState("");

  async function proteger() {
    setRetourProtection(await demanderPersistant());
  }

  async function choisirFichier() {
    setRetourFichier("");
    const r = await activerSauvegardeAuto();
    if (r.ok) setRetourFichier("ok");
    else if (r.raison === "erreur") setRetourFichier("erreur");
  }

  if (restauration) {
    return (
      <div className="accueil">
        <div className="accueil-contenu">
          <h2>Restaurer une sauvegarde</h2>
          <Restauration onFermer={() => setRestauration(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="accueil">
      <div className="accueil-contenu">
        <div className="points">
          {Array.from({ length: NB_ETAPES }, (_, i) => (
            <span key={i} className={`point ${i === etape ? "actif" : ""}`} />
          ))}
        </div>

        {etape === 0 && (
          <>
            <h2>Bienvenue sur Habibits</h2>
            <p>
              Tes défis et ton avancement sont enregistrés <strong>sur ce téléphone</strong>, dans ton navigateur. Rien
              n'est envoyé sur internet.
            </p>
            <p className="attention">
              Mais si tu effaces les données du navigateur, si tu changes de téléphone ou si tu désinstalles l'appli,
              tout peut disparaître.
            </p>
            <p>
              Prends 2 minutes pour mettre en place des protections. Tu peux aussi passer et y revenir plus tard dans
              Paramètres.
            </p>
            <div className="actions">
              <button className="btn" onClick={() => setEtape(1)}>
                C'est parti
              </button>
              <button className="btn discret" onClick={() => setRestauration(true)}>
                J'ai déjà une sauvegarde
              </button>
              <button className="btn discret" onClick={onTermine}>
                Passer
              </button>
            </div>
          </>
        )}

        {etape === 1 && (
          <>
            <h2>Installe l'appli</h2>
            {estInstallee() ? (
              <p className="ok-msg">✔ C'est fait : Habibits est installée sur ton écran d'accueil.</p>
            ) : (
              <>
                <p>
                  Dans le menu ⋮ de Chrome, appuie sur « Installer l'application » (ou « Ajouter à l'écran d'accueil
                  »), puis rouvre Habibits depuis son icône.
                </p>
                <p>
                  Pourquoi ? Une appli installée est mieux protégée par le téléphone, et les deux étapes suivantes
                  marchent mieux.
                </p>
              </>
            )}
            <div className="actions">
              <button className="btn" onClick={() => setEtape(2)}>
                Suivant
              </button>
              <button className="btn discret" onClick={() => setEtape(0)}>
                Retour
              </button>
            </div>
          </>
        )}

        {etape === 2 && (
          <>
            <h2>Évite le nettoyage automatique</h2>
            <p>
              Quand le téléphone manque de place, il peut supprimer les données de certains sites sans prévenir.
              Appuie ci-dessous pour lui demander de ne pas toucher à celles d'Habibits.
            </p>
            {s.persistant === "accorde" || retourProtection === "accorde" ? (
              <p className="ok-msg">✔ C'est protégé.</p>
            ) : (
              <div className="actions">
                <button className="btn" onClick={proteger}>
                  Protéger mes données
                </button>
              </div>
            )}
            {retourProtection === "non" && (
              <p className="attention">
                Le téléphone n'a pas dit oui pour l'instant. Pas de souci : Habibits redemandera tout seul à tes
                prochaines visites (ça marche mieux quand l'appli est installée et utilisée depuis quelques jours).
              </p>
            )}
            {retourProtection === "indisponible" && <p className="attention">Ton navigateur ne propose pas cette protection.</p>}
            <details>
              <summary>Ça protège de quoi ?</summary>
              <p>
                Du nettoyage automatique, pas de tes propres suppressions : si tu effaces toi-même les données du
                navigateur, tout part quand même. Pour ça, il y a la copie de secours (étape suivante).
              </p>
            </details>
            <div className="actions">
              <button className="btn" onClick={() => setEtape(3)}>
                Suivant
              </button>
              <button className="btn discret" onClick={() => setEtape(1)}>
                Retour
              </button>
            </div>
          </>
        )}

        {etape === 3 && (
          <>
            <h2>Fais une copie de secours</h2>
            {s.supporte ? (
              <>
                <p>
                  Habibits peut copier tes données dans un fichier de ton choix (par exemple dans Documents) et le
                  mettre à jour tout seul à chaque changement. Si tout disparaît un jour, tu restaures depuis ce
                  fichier.
                </p>
                <ul className="liste-infos">
                  <li>Appuie sur le bouton.</li>
                  <li>Choisis un dossier et valide.</li>
                  <li>Si Chrome te le propose, choisis « Autoriser à chaque visite ».</li>
                </ul>
                {retourFichier === "ok" || s.statut === "ok" ? (
                  <p className="ok-msg">✔ C'est en place : « {s.nom} » sera mis à jour tout seul.</p>
                ) : (
                  <div className="actions">
                    <button className="btn" onClick={choisirFichier}>
                      Choisir où sauvegarder
                    </button>
                  </div>
                )}
                {retourFichier === "erreur" && (
                  <p className="attention">Je n'ai pas réussi à créer le fichier. Réessaie ou choisis un autre dossier.</p>
                )}
                <details>
                  <summary>Et si je déplace le fichier ?</summary>
                  <p>
                    Pas de panique : Habibits te prévient dans un bandeau et tu choisis un nouvel emplacement. Pour ta
                    vie privée, le navigateur ne donne que le nom du fichier, pas son emplacement.
                  </p>
                </details>
              </>
            ) : (
              <p>
                Ton navigateur ne sait pas faire de copie automatique (c'est le cas de Firefox et de Safari, par
                exemple). Pas grave : dans Paramètres, section Mes données, tu peux exporter tes données quand tu veux
                (vers Drive, par mail…).
              </p>
            )}
            <div className="actions">
              <button className="btn" onClick={onTermine}>
                Terminer
              </button>
              <button className="btn discret" onClick={() => setEtape(2)}>
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
