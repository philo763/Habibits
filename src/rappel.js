import { cleDate } from "./dates";

const pad = (n) => String(n).padStart(2, "0");

// Télécharge un événement quotidien récurrent, à importer dans le calendrier du téléphone
export function telechargerRappel(heure, minute) {
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  const jour = cleDate(demain).replaceAll("-", "");
  const maintenant = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Habibits//FR",
    "BEGIN:VEVENT",
    "UID:rappel-quotidien@habibits",
    `DTSTAMP:${maintenant}`,
    `DTSTART:${jour}T${pad(heure)}${pad(minute)}00`,
    "RRULE:FREQ=DAILY",
    "SUMMARY:Habibits : valide ton défi du jour",
    "DESCRIPTION:Ouvre Habibits pour valider le défi du jour et choisir celui de demain.",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Habibits",
    "TRIGGER:PT0S",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lignes.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = "habibits-rappel.ics";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}