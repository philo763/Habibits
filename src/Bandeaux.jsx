import { useEffect, useState } from "react";
import { chargerJours } from "./storage";
import {
  useSauvegarde,
  reconnecter,
  activerSauvegardeAuto,
  resoudreConflit,
  sauvegarderMaintenant,
  exporterDonnees,
  joursValidesSansSauvegarde,
  rappelEstMasque,
  masquerRappelAujourdhui,
  formaterCourt,
} from "./sauvegarde";

// Petit repère dans l'en-tête : la sauvegarde automatique marche-t-elle ?
export function Indicateur({ onClick }) {
  const s = useSauvegarde();
  if (s.statut === "inactive") return null;

  const probleme = s.statut !== "ok";
  let texte = "✔ Sauvegarde active";
  if (probleme) texte = "⚠ Sauvegarde à vérifier";
  else if (s.derniere) texte = `✔ Sauvegardé ${formaterCourt(s.derniere)}`;

  return (
    <button className={`indicateur ${probleme ? "alerte" : ""}`} onClick={onClick}>
      {texte}
    </button>
  );
}

// Messages affichés en haut de l'écran quand il y a quelque chose à faire
export function Bandeaux() {
  const s = useSauvegarde();
  const [jours, setJours] = useState({});
  const [masque, setMasque] = useState(rappelEstMasque());
  const [retour, setRetour] = useState("");

  useEffect(() => {
    const charger = () => chargerJours().then(setJours);
    charger();
    window.addEventListener("habibits:donnees-modifiees", charger);
    return () => window.removeEventListener("habibits:donnees-modifiees", charger);
  }, []);

  async function surReconnecter() {
    setRetour("");
    const r = await reconnecter();
    if (!r.ok && r.raison === "refuse") {
      setRetour("L'accès a été refusé. Appuie à nouveau sur « Reconnecter » et choisis « Autoriser ».");
    }
  }

  async function surNouvelEmplacement() {
    setRetour("");
    const r = await activerSauvegardeAuto();
    if (!r.ok && r.raison === "erreur") {
      setRetour("Je n'ai pas réussi à créer le fichier. Réessaie ou choisis un autre dossier.");
    }
  }

  async function surRestaurer() {
    const r = await resoudreConflit("restaurer");
    if (r === "recharger") window.location.reload();
  }

  function surGarder() {
    const ok = window.confirm("Le fichier de sauvegarde sera remplacé par les données de ce téléphone. Continuer ?");
    if (ok) resoudreConflit("ecraser");
  }

  const retourJSX = retour && <p className="attention">{retour}</p>;

  if (s.statut === "reconnecter") {
    return (
      <div className="bandeau">
        <p>
          Ta sauvegarde automatique est en pause : le téléphone veut que tu reconfirmes l'accès au fichier «{" "}
          {s.nom} ».
        </p>
        {retourJSX}
        <div className="actions">
          <button className="btn petit" onClick={surReconnecter}>
            Reconnecter
          </button>
        </div>
      </div>
    );
  }

  if (s.statut === "introuvable") {
    return (
      <div className="bandeau">
        <p>
          Le fichier de sauvegarde « {s.nom} » est introuvable. Il a peut-être été déplacé, renommé ou supprimé.
        </p>
        {retourJSX}
        <div className="actions">
          <button className="btn petit" onClick={surNouvelEmplacement}>
            Choisir un nouvel emplacement
          </button>
        </div>
      </div>
    );
  }

  if (s.statut === "erreur") {
    return (
      <div className="bandeau">
        <p>La dernière sauvegarde n'a pas marché. Habibits réessaiera à ta prochaine action.</p>
        <div className="actions">
          <button className="btn petit" onClick={sauvegarderMaintenant}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (s.statut === "conflit") {
    return (
      <div className="bandeau">
        <p>
          Le fichier « {s.nom} » contient plus d'historique que ce téléphone
          {s.conflit ? ` (${s.conflit.nbValides} jours validés)` : ""}. Tu veux récupérer ces données ?
        </p>
        <div className="actions">
          <button className="btn petit" onClick={surRestaurer}>
            Restaurer depuis le fichier
          </button>
          <button className="btn petit discret" onClick={surGarder}>
            Garder ce téléphone
          </button>
        </div>
      </div>
    );
  }

  // Pas de sauvegarde automatique : on rappelle de temps en temps de faire une copie à la main
  if (s.statut === "inactive" && !masque) {
    const n = joursValidesSansSauvegarde(jours, s);
    if (n >= 7) {
      return (
        <div className="bandeau info">
          <p>Tu as validé {n} jours depuis ta dernière sauvegarde. Fais-en une copie pour ne rien perdre.</p>
          <div className="actions">
            <button className="btn petit" onClick={exporterDonnees}>
              Sauvegarder maintenant
            </button>
            <button
              className="btn petit discret"
              onClick={() => {
                masquerRappelAujourdhui();
                setMasque(true);
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
}
