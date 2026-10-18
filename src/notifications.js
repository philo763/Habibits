import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

async function permissionOk() {
  // Les notifications ne fonctionnent que dans l'appli installée, pas dans le navigateur
  if (!Capacitor.isNativePlatform()) return false;
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === "granted";
}

export async function programmerRappel(heure, minute) {
  if (!(await permissionOk())) return false;

  // On annule l'ancien rappel pour éviter les doublons
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: "Habibits",
        body: "Valide le défi du jour et choisis celui de demain !",
        schedule: { on: { hour: heure, minute }, allowWhileIdle: true },
      },
    ],
  });
  return true;
}

export async function notificationTest() {
  if (!(await permissionOk())) return false;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 2,
        title: "Habibits",
        body: "Test réussi : les notifications fonctionnent !",
        schedule: { at: new Date(Date.now() + 5000) },
      },
    ],
  });
  return true;
}