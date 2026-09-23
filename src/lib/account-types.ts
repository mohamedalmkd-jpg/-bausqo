export type AccountTypeValue =
  | "jobseeker"
  | "freelancer"
  | "team"
  | "subcontractor"
  | "company"
  | "client"
  | "general_contractor"
  // Bestandswerte aus der bisherigen Registrierung
  | "worker";

export const accountTypeOptions: { value: AccountTypeValue; label: string; hint: string }[] = [
  { value: "jobseeker", label: "Arbeitssuchend", hint: "Ich suche eine Anstellung auf dem Bau" },
  { value: "freelancer", label: "Selbstständig", hint: "Ich arbeite auf eigene Rechnung" },
  { value: "team", label: "Team", hint: "Wir übernehmen als Kolonne Aufträge" },
  { value: "subcontractor", label: "Subunternehmer", hint: "Wir arbeiten im Auftrag anderer Firmen" },
  { value: "company", label: "Bauunternehmen", hint: "Wir suchen Personal und Partner" },
  { value: "client", label: "Auftraggeber", hint: "Ich vergebe Bauaufträge" },
  { value: "general_contractor", label: "Generalunternehmer", hint: "Wir steuern komplette Bauprojekte" },
];

const labels: Record<string, string> = {
  ...Object.fromEntries(accountTypeOptions.map((o) => [o.value, o.label])),
  worker: "Fachkraft",
};

export function accountTypeLabel(value: string | null | undefined) {
  if (!value) return "Konto";
  return labels[value] ?? "Konto";
}

/** Kontotypen, bei denen ein Firmenname sinnvoll ist. */
export const companyAccountTypes: AccountTypeValue[] = ["company", "subcontractor", "general_contractor", "client", "team"];
