import { Preferences } from "@capacitor/preferences";
import { DEFIS_DEPART } from "./data/defisDepart";

const CLE_DEFIS = "defis";

export async function sauvegarderDefis(defis) {
  await Preferences.set({ key: CLE_DEFIS, value: JSON.stringify(defis) });
}

export async function chargerDefis() {
  const { value } = await Preferences.get({ key: CLE_DEFIS });
  if (value) return JSON.parse(value);
  // Premier lancement : on part des défis de départ
  await sauvegarderDefis(DEFIS_DEPART);
  return DEFIS_DEPART;
}
const CLE_JOURS = "jours";

export async function chargerJours() {
  const { value } = await Preferences.get({ key: CLE_JOURS });
  return value ? JSON.parse(value) : {};
}

export async function sauvegarderJours(jours) {
  await Preferences.set({ key: CLE_JOURS, value: JSON.stringify(jours) });
}
const CLE_RAPPEL = "rappel";

export async function chargerRappel() {
  const { value } = await Preferences.get({ key: CLE_RAPPEL });
  return value ? JSON.parse(value) : { heure: 20, minute: 0 };
}

export async function sauvegarderRappel(rappel) {
  await Preferences.set({ key: CLE_RAPPEL, value: JSON.stringify(rappel) });
}