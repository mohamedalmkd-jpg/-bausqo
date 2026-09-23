import { supabase } from "@/integrations/supabase/client";
import { marketItems } from "./demo-data";

export type JobStatus = "draft" | "published" | "paused" | "completed";

export type JobRow = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  contract_type: string;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  start_date: string | null;
  duration: string | null;
  workers_needed: number;
  budget_min: number | null;
  budget_max: number | null;
  requirements: string | null;
  end_date: string | null;
  qualifications: string | null;
  experience_level: string | null;
  compensation: string | null;
  availability: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  media_paths: string[];
  status: JobStatus;
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type JobDraft = Omit<
  JobRow,
  "id" | "creator_id" | "created_at" | "updated_at" | "published_at" | "status" | "visibility"
> & { status?: JobStatus; visibility?: string };

export const jobCategories = [
  "Elektriker",
  "Maurer",
  "Trockenbau",
  "Dachdecker",
  "Sanitär",
  "Heizung",
  "Maler",
  "Fliesenleger",
  "Gerüstbau",
  "Tiefbau",
  "Straßenbau",
  "Rohbau",
  "Sonstiges",
] as const;

export const contractTypes = [
  "Direktauftrag",
  "Subunternehmer",
  "Werkvertrag",
  "Projekt",
  "Sonstiger Auftrag",
] as const;

export const germanStates = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
] as const;

export const jobStatusLabels: Record<JobStatus, string> = {
  draft: "Entwurf",
  published: "Veröffentlicht",
  paused: "Pausiert",
  completed: "Abgeschlossen",
};

/** Grobe Koordinaten bekannter Städte aus dem Demo-Datensatz – nur zur Kartenanzeige. */
export function coordsForCity(city: string | null): { lat: number; lng: number } | null {
  if (!city) return null;
  const hit = marketItems.find((i) => i.location.toLowerCase() === city.trim().toLowerCase());
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}

export function emptyDraft(): JobDraft {
  return {
    title: "",
    description: "",
    category: "Elektriker",
    contract_type: "Direktauftrag",
    postal_code: "",
    city: "",
    state: "",
    latitude: null,
    longitude: null,
    radius_km: 50,
    start_date: null,
    duration: "",
    workers_needed: 1,
    budget_min: null,
    budget_max: null,
    requirements: "",
    end_date: null,
    qualifications: "",
    experience_level: "",
    compensation: "",
    availability: "Sofort",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    media_paths: [],
  };
}

export const experienceLevels = ["Anfänger", "1–3 Jahre", "3–5 Jahre", "5+ Jahre"] as const;
export const availabilityOptions = ["Sofort", "Ab Startdatum", "Flexibel"] as const;

export function validateDraft(draft: JobDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.title.trim().length < 5) errors["title"] = "Bitte einen aussagekräftigen Titel angeben (min. 5 Zeichen).";
  if (draft.description.trim().length < 20) errors["description"] = "Bitte mindestens 20 Zeichen beschreiben.";
  if (!draft.category) errors["category"] = "Bitte ein Gewerk wählen.";
  if (!draft.city?.trim()) errors["city"] = "Bitte die Stadt angeben.";
  if (!/^\d{5}$/.test(draft.postal_code ?? "")) errors["postal_code"] = "Bitte eine fünfstellige PLZ angeben.";
  if (!draft.workers_needed || draft.workers_needed < 1) errors["workers_needed"] = "Mindestens eine Person angeben.";
  if (draft.budget_min != null && draft.budget_max != null && draft.budget_min > draft.budget_max)
    errors["budget_max"] = "Das maximale Budget muss größer sein als das minimale.";
  if (draft.start_date && draft.end_date && draft.end_date < draft.start_date)
    errors["end_date"] = "Das Enddatum darf nicht vor dem Startdatum liegen.";
  if (!draft.contact_name?.trim()) errors["contact_name"] = "Bitte einen Ansprechpartner angeben.";
  const email = draft.contact_email?.trim() ?? "";
  const phone = draft.contact_phone?.trim() ?? "";
  if (!email && !phone) errors["contact_email"] = "Bitte mindestens E-Mail oder Telefon angeben.";
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors["contact_email"] = "Bitte eine gültige E-Mail-Adresse angeben.";
  return errors;
}

export async function listPublishedJobs(): Promise<JobRow[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as JobRow[];
}

export async function getJob(id: string): Promise<JobRow | null> {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as JobRow | null) ?? null;
}

export async function listMyJobs(userId: string): Promise<JobRow[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("creator_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as JobRow[];
}

export async function createJob(userId: string, draft: JobDraft, status: JobStatus): Promise<JobRow> {
  const coords = coordsForCity(draft.city);
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...draft,
      creator_id: userId,
      status,
      latitude: draft.latitude ?? coords?.lat ?? null,
      longitude: draft.longitude ?? coords?.lng ?? null,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as JobRow;
}

export async function updateJob(id: string, patch: Partial<JobRow>): Promise<JobRow> {
  const { data, error } = await supabase.from("jobs").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as JobRow;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type ApplicationRow = {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  available_from: string | null;
  status: string;
  created_at: string;
};

export async function applyToJob(jobId: string, applicantId: string, message: string, availableFrom: string | null) {
  const { data, error } = await supabase
    .from("job_applications")
    .insert({ job_id: jobId, applicant_id: applicantId, message, available_from: availableFrom })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ApplicationRow;
}

export async function myApplication(jobId: string, applicantId: string) {
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("applicant_id", applicantId)
    .maybeSingle();
  return (data as ApplicationRow | null) ?? null;
}

export async function applicationsForJob(jobId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApplicationRow[];
}

export async function myApplications(userId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApplicationRow[];
}

export async function setApplicationStatus(id: string, status: string) {
  const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Findet oder erstellt die Unterhaltung zu einem Auftrag und sendet die erste Nachricht. */
export async function startConversation(params: {
  jobId: string;
  subject: string;
  senderId: string;
  recipientId: string;
  body: string;
}) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("job_id", params.jobId)
    .or(`and(created_by.eq.${params.senderId},recipient_id.eq.${params.recipientId}),and(created_by.eq.${params.recipientId},recipient_id.eq.${params.senderId})`)
    .maybeSingle();

  let conversationId = (existing as { id: string } | null)?.id;
  if (!conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        job_id: params.jobId,
        subject: params.subject,
        created_by: params.senderId,
        recipient_id: params.recipientId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    conversationId = (data as { id: string }).id;
  }

  const { error: msgError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: params.senderId, body: params.body });
  if (msgError) throw new Error(msgError.message);
  return conversationId;
}

/** Findet oder erstellt eine direkte Unterhaltung zwischen zwei Konten. */
export async function startDirectConversation(params: {
  senderId: string;
  recipientId: string;
  recipientName: string;
  body: string;
}) {
  const { data: existing, error: lookupError } = await supabase
    .from("conversations")
    .select("id")
    .is("job_id", null)
    .or(`and(created_by.eq.${params.senderId},recipient_id.eq.${params.recipientId}),and(created_by.eq.${params.recipientId},recipient_id.eq.${params.senderId})`)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  let conversationId = (existing as { id: string } | null)?.id;
  if (!conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        job_id: null,
        subject: `Direktchat mit ${params.recipientName}`,
        created_by: params.senderId,
        recipient_id: params.recipientId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    conversationId = data.id;
  }

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: params.senderId,
    body: params.body,
  });
  if (messageError) throw new Error(messageError.message);
  return conversationId;
}

export async function isJobSaved(userId: string, jobId: string) {
  const { data } = await supabase.from("saved_jobs").select("id").eq("user_id", userId).eq("job_id", jobId).maybeSingle();
  return Boolean(data);
}

export async function toggleSavedJob(userId: string, jobId: string) {
  const saved = await isJobSaved(userId, jobId);
  if (saved) {
    const { error } = await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", jobId);
    if (error) throw new Error(error.message);
    return false;
  }
  const { error } = await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId });
  if (error) throw new Error(error.message);
  return true;
}

export function jobLocationLabel(job: JobRow) {
  return [job.postal_code, job.city].filter(Boolean).join(" ") || "Ort offen";
}

export function jobBudgetLabel(job: JobRow) {
  if (job.budget_min == null && job.budget_max == null) return "Budget auf Anfrage";
  if (job.budget_min != null && job.budget_max != null) return `${job.budget_min} – ${job.budget_max} €`;
  return `${job.budget_min ?? job.budget_max} €`;
}

/** Legt nach dem Veröffentlichen eine echte Benachrichtigung für den Auftraggeber an. */
export async function notifyJobPublished(userId: string, job: JobRow): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    kind: "job_published",
    title: "Auftrag veröffentlicht",
    body: `„${job.title}“ ist jetzt öffentlich sichtbar und durchsuchbar.`,
    link: `/auftrag/${job.id}`,
  });
  if (error) throw new Error(error.message);
}
