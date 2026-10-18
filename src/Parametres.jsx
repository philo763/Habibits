import { useEffect, useState } from "react";
import { chargerRappel, sauvegarderRappel } from "./storage";
import { telechargerRappel } from "./rappel";
import Restauration from "./Restauration";
import {
  useSauvegarde,
  activerSauvegardeAuto,
  reconnecter,
  desactiverSauvegardeAuto,
  demanderPersistant,
  rafraichirPersistant,
  exporterDonnees,
  existeCopieAvantImport,
  annulerDernierImport,
  formaterDateHeure,
} from "./sauvegarde";

const pad = (n) => String(n).padStart(2, "0");

const TEXTE_STATUT = {
  inactive: "Pas encore activée",
  ok: "Active ✔",
  reconnecter: "En pause : à reconnecter",
  introuvable: "Fichier introuvable",
  erreur: "Problème à la dernière sauvegarde",
  conflit: "À vérifier : le fichier a plus d'historique (voir le bandeau en haut)",
};

const TEXTE_PERSISTANT = {
  inconnu: "Pas encore demandée",
  accorde: "Activée ✔",
  non: "Pas accordée par le téléphone",
  indisponible: "Pas disponible sur ce navigateur",
};

export default function Parametres({ onRevoirAccueil }) {
  const s = useSauvegarde();
  const [rappel, setRappel] = useState(null);
  const [restaurer, setRestaurer] = useState(false);
  const [message, setMessage] = useState(null); // { texte, erreur }

  useEffect(() => {
    chargerRappel().then(setRappel);
    rafraichirPersistant();
  }, []);

  async function changerHeure(valeur) {
    const [heure, minute] = valeur.split(":").map(Number);
    if (Number.isNaN(heure) || Number.isNaN(minute)) return;
    const nouveau = { heure, minute };
    setRappel(nouveau);
    await sauvegarderRappel(nouveau);
  }

  async function activer() {
    setMessage(null);
    const r = await activerSauvegardeAuto();
    if (!r.ok && r.raison === "erreur") {
      setMessage({ texte: "Je n'ai pas réussi à créer le fichier. Réessaie ou choisis un autre dossier.", erreur: true });
    }
  }

  async function surReconnecter() {
    setMessage(null);
    const r = await reconnecter();
    if (!r.ok && r.raison === "refuse") {
      setMessage({ texte: "L'accès a été refusé. Appuie à nouveau sur « Reconnecter » et choisis « Autoriser ».", erreur: true });
    }
  }

  function arreter() {
    if (window.confirm("Arrêter la sauvegarde automatique ? Le fichier existant ne sera pas supprimé.")) {
      desactiverSauvegardeAuto();
    }
  }

  async function exporter() {
    setMessage(null);
    const r = await exporterDonnees();
    if (r === "partage") setMessage({ texte: "Export envoyé ✔", erreur: false });
    if (r === "telecharge") setMessage({ texte: "Fichier téléchargé ✔ (regarde dans tes Téléchargements).", erreur: false });
  }

  async function annulerRestauration() {
    if (window.confirm("Revenir aux données que tu avais avant la dernière restauration ?")) {
      if (await annulerDernierImport()) window.location.reload();
    }
  }

  return (
    <div>
      <div className="tuile">
        <h2>Rappel quotidien</h2>
        <p>
          Choisis une heure, puis ajoute le rappel à l'appli Calendrier de ton téléphone : c'est elle qui t'enverra la
          notification chaque jour.
        </p>
        {rappel && (
          <>
            <label>
              Heure du rappel
              <input
                type="time"
                value={`${pad(rappel.heure)}:${pad(rappel.minute)}`}
                onChange={(e) => changerHeure(e.target.value)}
              />
            </label>
            <button className="btn" onClick={() => telechargerRappel(rappel.heure, rappel.minute)}>
              Ajouter à mon calendrier
            </button>
          </>
        )}
      </div>

      <div className="tuile">
        <h2>Mes données</h2>
        <p>Tes défis et ton avancement sont enregistrés sur ce téléphone, dans ton navigateur. Voici comment les protéger.</p>

        <h3 className="sous-titre">Sauvegarde automatique</h3>
        <p>Habibits copie tes données dans un fichier que tu choisis, et le met à jour tout seul à chaque changement.</p>
        {s.supporte ? (
          <>
            <p className="statut">État : {TEXTE_STATUT[s.statut]}</p>
            {s.nom && (
              <p>
                Fichier : <strong>{s.nom}</strong>
              </p>
            )}
            {s.derniere && <p>Dernière sauvegarde : {formaterDateHeure(s.derniere)}</p>}
            <p className="note">
              Pour ta vie privée, le navigateur ne donne que le nom du fichier, pas son emplacement. Si tu le déplaces,
              le renommes ou le supprimes, Habibits te prévient.
            </p>
            <div className="actions">
              {s.statut === "inactive" && (
                <button className="btn" onClick={activer}>
                  Activer la sauvegarde automatique
                </button>
              )}
              {s.statut === "reconnecter" && (
                <button className="btn" onClick={surReconnecter}>
                  Reconnecter
                </button>
              )}
              {(s.statut === "ok" || s.statut === "erreur" || s.statut === "introuvable") && (
                <button className="btn" onClick={activer}>
                  {s.statut === "introuvable" ? "Choisir un nouvel emplacement" : "Changer d'emplacement"}
                </button>
              )}
              {s.statut !== "inactive" && (
                <button className="btn discret" onClick={arreter}>
                  Arrêter
                </button>
              )}
            </div>
          </>
        ) : (
          <p>
            Ton navigateur ne sait pas faire ça (c'est le cas de Firefox et de Safari, par exemple). Pas grave :
            utilise l'export ci-dessous de temps en temps.
          </p>
        )}

        <h3 className="sous-titre">Protection contre le nettoyage</h3>
        <p>
          Quand le téléphone manque de place, il peut supprimer les données des sites sans prévenir. On lui demande de ne
          pas toucher à celles d'Habibits.
        </p>
        <p className="statut">État : {TEXTE_PERSISTANT[s.persistant]}</p>
        {s.persistant !== "accorde" && s.persistant !== "indisponible" && (
          <div className="actions">
            <button className="btn" onClick={() => demanderPersistant()}>
              Demander la protection
            </button>
          </div>
        )}
        <p className="note">
          Ça ne protège pas si tu effaces toi-même les données du navigateur : pour ça, il y a la sauvegarde
          automatique.
        </p>

        <h3 className="sous-titre">Exporter mes données</h3>
        <p>
          Tu récupères un fichier à envoyer où tu veux : Drive, mail, ordinateur… Pratique pour changer de téléphone ou
          garder une copie.
        </p>
        <div className="actions">
          <button className="btn" onClick={exporter}>
            Exporter mes données
          </button>
        </div>
        {s.dernierExport && <p className="note">Dernier export : {formaterDateHeure(s.dernierExport)}</p>}

        <h3 className="sous-titre">Restaurer</h3>
        {restaurer ? (
          <Restauration onFermer={() => setRestaurer(false)} />
        ) : (
          <div className="actions">
            <button className="btn" onClick={() => setRestaurer(true)}>
              Restaurer depuis un fichier
            </button>
            {existeCopieAvantImport() && (
              <button className="btn discret" onClick={annulerRestauration}>
                Annuler la dernière restauration
              </button>
            )}
          </div>
        )}

        {message && <p className={message.erreur ? "attention" : "ok-msg"}>{message.texte}</p>}

        <div className="actions">
          <button className="btn discret" onClick={onRevoirAccueil}>
            Revoir l'explication de départ
          </button>
        </div>
      </div>
    </div>
  );
}
