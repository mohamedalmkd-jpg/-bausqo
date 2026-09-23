export type ProfileKind = "worker" | "team" | "company";

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export type ProfileField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  help?: string;
};

export type ProfileSection = { title: string; fields: ProfileField[] };

export const profileKindLabels: Record<ProfileKind, string> = {
  worker: "Fachkraft / Selbstständiger",
  team: "Arbeitsteam",
  company: "Unternehmen",
};

const availability = ["Sofort verfügbar", "Ab festem Startdatum", "Aktuell ausgelastet"];
const licence = ["Kein Führerschein", "Klasse B", "Klasse BE", "Klasse C/CE"];

export const profileSchema: Record<ProfileKind, ProfileSection[]> = {
  worker: [
    {
      title: "Person",
      fields: [
        { key: "photo", label: "Profilbild (Bild-URL)", type: "text", placeholder: "https://…", help: "Datei-Upload folgt mit angebundenem Konto." },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "job", label: "Beruf", type: "text", required: true, placeholder: "z. B. Elektriker" },
        { key: "category", label: "Fachgebiet", type: "text", required: true, placeholder: "z. B. Elektrotechnik" },
        { key: "skills", label: "Skills", type: "text", placeholder: "Kommagetrennt" },
        { key: "experience", label: "Erfahrung (Jahre)", type: "number" },
      ],
    },
    {
      title: "Standort & Einsatz",
      fields: [
        { key: "postalCode", label: "PLZ", type: "text", required: true, placeholder: "50667" },
        { key: "city", label: "Stadt", type: "text", required: true },
        { key: "radius", label: "Suchradius (km)", type: "number", required: true },
        { key: "availability", label: "Verfügbarkeit", type: "select", options: availability, required: true },
        { key: "startDate", label: "Startdatum", type: "date" },
        { key: "projectDuration", label: "Projektdauer", type: "text", placeholder: "z. B. bis 6 Monate" },
      ],
    },
    {
      title: "Qualifikation",
      fields: [
        { key: "qualifications", label: "Qualifikationen", type: "text" },
        { key: "certificates", label: "Zertifikate", type: "text" },
        { key: "languages", label: "Sprachen", type: "text" },
        { key: "licence", label: "Führerschein", type: "select", options: licence },
        { key: "rate", label: "Gewünschtes Budget / Stundenlohn", type: "text", placeholder: "z. B. 28 €/Std." },
        { key: "description", label: "Beschreibung", type: "textarea" },
      ],
    },
  ],
  team: [
    {
      title: "Team",
      fields: [
        { key: "name", label: "Teamname", type: "text", required: true },
        { key: "contact", label: "Ansprechpartner", type: "text", required: true },
        { key: "size", label: "Teamgröße", type: "number", required: true },
        { key: "categories", label: "Fachgebiete", type: "text", required: true, placeholder: "Kommagetrennt" },
        { key: "experience", label: "Erfahrung (Jahre)", type: "number" },
      ],
    },
    {
      title: "Standort & Einsatz",
      fields: [
        { key: "city", label: "Standort", type: "text", required: true },
        { key: "postalCode", label: "PLZ", type: "text", required: true },
        { key: "radius", label: "Einsatzradius (km)", type: "number", required: true },
        { key: "availability", label: "Verfügbarkeit", type: "select", options: availability, required: true },
        { key: "startDate", label: "Startdatum", type: "date" },
        { key: "projectDuration", label: "Projektdauer", type: "text" },
      ],
    },
    {
      title: "Weitere Angaben",
      fields: [
        { key: "qualifications", label: "Qualifikationen", type: "text" },
        { key: "description", label: "Beschreibung", type: "textarea" },
      ],
    },
  ],
  company: [
    {
      title: "Unternehmen",
      fields: [
        { key: "name", label: "Firmenname", type: "text", required: true },
        { key: "logo", label: "Logo (Bild-URL)", type: "text", placeholder: "https://…", help: "Datei-Upload folgt mit angebundenem Konto." },
        { key: "contact", label: "Ansprechpartner", type: "text", required: true },
        { key: "website", label: "Website", type: "text", placeholder: "https://…" },
        { key: "employees", label: "Mitarbeiterzahl", type: "number", required: true },
      ],
    },
    {
      title: "Adresse",
      fields: [
        { key: "street", label: "Adresse", type: "text", required: true },
        { key: "postalCode", label: "PLZ", type: "text", required: true },
        { key: "city", label: "Stadt", type: "text", required: true },
        { key: "state", label: "Bundesland", type: "text", required: true },
        { key: "region", label: "Einsatzgebiet", type: "text", placeholder: "z. B. NRW + 150 km" },
      ],
    },
    {
      title: "Leistungen",
      fields: [
        { key: "categories", label: "Fachgebiete", type: "text", required: true, placeholder: "Kommagetrennt" },
        { key: "services", label: "Tätigkeitsbereiche", type: "text" },
        { key: "availability", label: "Verfügbarkeit", type: "select", options: availability, required: true },
        { key: "references", label: "Referenzen", type: "textarea" },
        { key: "description", label: "Beschreibung", type: "textarea" },
      ],
    },
  ],
};

export type ProfileValues = Record<string, string>;

export const defaultProfiles: Record<ProfileKind, ProfileValues> = {
  worker: { name: "Demo Fachkraft", job: "Elektriker", category: "Elektrotechnik", skills: "Installation, Messtechnik", experience: "8", postalCode: "50667", city: "Köln", radius: "80", availability: "Sofort verfügbar", licence: "Klasse B", languages: "Deutsch, Englisch", rate: "28 €/Std.", description: "" },
  team: { name: "Demo Team", contact: "Teamleitung", size: "8", categories: "Trockenbau, Innenausbau", experience: "6", city: "Köln", postalCode: "50667", radius: "100", availability: "Ab festem Startdatum", description: "" },
  company: { name: "Rheinbau Projekt GmbH", contact: "Projektleitung", employees: "42", street: "Beispielstraße 12", postalCode: "50667", city: "Köln", state: "Nordrhein-Westfalen", categories: "Elektrotechnik, Innenausbau", services: "Gewerbeausbau, Sanierung", availability: "Sofort verfügbar", region: "NRW + 150 km", website: "", references: "", description: "" },
};

export function validateProfile(kind: ProfileKind, values: ProfileValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of profileSchema[kind]) {
    for (const field of section.fields) {
      const value = (values[field.key] ?? "").trim();
      if (field.required && !value) {
        errors[field.key] = "Pflichtfeld";
        continue;
      }
      if (!value) continue;
      if (field.type === "number" && (!/^\d+$/.test(value) || Number(value) <= 0)) errors[field.key] = "Bitte eine Zahl größer 0 angeben";
      if (field.key === "postalCode" && !/^\d{5}$/.test(value)) errors[field.key] = "PLZ muss 5 Ziffern haben";
      if ((field.key === "website" || field.key === "logo" || field.key === "photo") && !/^https?:\/\/\S+$/.test(value)) errors[field.key] = "Bitte eine vollständige URL mit https:// angeben";
    }
  }
  return errors;
}

export function profileCompleteness(kind: ProfileKind, values: ProfileValues): number {
  const all = profileSchema[kind].flatMap((s) => s.fields);
  const filled = all.filter((f) => (values[f.key] ?? "").trim().length > 0).length;
  return Math.round((filled / all.length) * 100);
}
