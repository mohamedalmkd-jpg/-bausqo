import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultProfiles, type ProfileKind, type ProfileValues } from "./profile-schema";

export type ApplicationStatus = "Neu" | "Angesehen" | "Im Gespräch" | "Angenommen" | "Abgelehnt" | "Abgeschlossen";

export type ApplicationEntry = {
  id: string;
  itemId: number;
  title: string;
  provider: string;
  message: string;
  availableFrom: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type ContactEntry = {
  id: string;
  itemId: number;
  title: string;
  provider: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type NotificationEntry = {
  id: string;
  kind: "Bewerbung" | "Nachricht" | "Gespeichert" | "Suchauftrag" | "Profil";
  title: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export type SavedSearch = {
  id: string;
  label: string;
  kind: string;
  query: string;
  category: string;
  location: string;
  radiusKm: number;
  createdAt: string;
};

export type ProfileState = { kind: ProfileKind; values: ProfileValues };

type WorkspaceState = {
  saved: number[];
  applications: ApplicationEntry[];
  contacts: ContactEntry[];
  notifications: NotificationEntry[];
  savedSearches: SavedSearch[];
  profile: ProfileState;
};

const EMPTY: WorkspaceState = {
  saved: [],
  applications: [],
  contacts: [],
  notifications: [],
  savedSearches: [],
  profile: { kind: "company", values: defaultProfiles.company },
};
const STORAGE_KEY = "baumatch.workspace.v2";

type WorkspaceApi = WorkspaceState & {
  hydrated: boolean;
  isSaved: (itemId: number) => boolean;
  toggleSaved: (item: { id: number; title: string }) => boolean;
  addApplication: (input: Omit<ApplicationEntry, "id" | "status" | "createdAt">) => void;
  hasApplied: (itemId: number) => boolean;
  addContact: (input: Omit<ContactEntry, "id" | "createdAt">) => void;
  markNotificationsRead: () => void;
  unreadCount: number;
  addSavedSearch: (input: Omit<SavedSearch, "id" | "createdAt">) => void;
  removeSavedSearch: (id: string) => void;
  setProfileKind: (kind: ProfileKind) => void;
  saveProfile: (values: ProfileValues) => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceApi | null>(null);

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<WorkspaceState>) });
    } catch {
      // corrupted local data is ignored on purpose
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable (private mode) – state stays in memory
    }
  }, [state, hydrated]);

  const pushNotification = useCallback((n: Omit<NotificationEntry, "id" | "createdAt" | "read">) => {
    setState((prev) => ({
      ...prev,
      notifications: [{ ...n, id: newId(), createdAt: new Date().toISOString(), read: false }, ...prev.notifications].slice(0, 50),
    }));
  }, []);

  const api = useMemo<WorkspaceApi>(() => ({
    ...state,
    hydrated,
    isSaved: (itemId) => state.saved.includes(itemId),
    toggleSaved: (item) => {
      const wasSaved = state.saved.includes(item.id);
      setState((prev) => ({
        ...prev,
        saved: wasSaved ? prev.saved.filter((x) => x !== item.id) : [item.id, ...prev.saved],
      }));
      if (!wasSaved) {
        pushNotification({ kind: "Gespeichert", title: "Eintrag gespeichert", text: item.title });
      }
      return !wasSaved;
    },
    hasApplied: (itemId) => state.applications.some((a) => a.itemId === itemId),
    addApplication: (input) => {
      setState((prev) => ({
        ...prev,
        applications: [{ ...input, id: newId(), status: "Neu", createdAt: new Date().toISOString() }, ...prev.applications],
      }));
      pushNotification({ kind: "Bewerbung", title: "Bewerbung lokal gespeichert", text: input.title });
    },
    addContact: (input) => {
      setState((prev) => ({
        ...prev,
        contacts: [{ ...input, id: newId(), createdAt: new Date().toISOString() }, ...prev.contacts],
      }));
      pushNotification({ kind: "Nachricht", title: "Anfrage lokal gespeichert", text: input.title });
    },
    markNotificationsRead: () => {
      setState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
    },
    unreadCount: state.notifications.filter((n) => !n.read).length,
    addSavedSearch: (input) => {
      setState((prev) => ({
        ...prev,
        savedSearches: [{ ...input, id: newId(), createdAt: new Date().toISOString() }, ...prev.savedSearches].slice(0, 20),
      }));
      pushNotification({ kind: "Suchauftrag", title: "Suchauftrag lokal gespeichert", text: input.label });
    },
    removeSavedSearch: (id) => {
      setState((prev) => ({ ...prev, savedSearches: prev.savedSearches.filter((s) => s.id !== id) }));
    },
    setProfileKind: (kind) => {
      setState((prev) => ({ ...prev, profile: { kind, values: { ...defaultProfiles[kind], ...(prev.profile.kind === kind ? prev.profile.values : {}) } } }));
    },
    saveProfile: async (values) => {
      if (typeof window === "undefined") throw new Error("Speichern ist nur im Browser möglich.");
      const next: WorkspaceState = { ...state, profile: { kind: state.profile.kind, values } };
      // Echte Persistenz: Browser-Speicher. Ein Serverkonto ist noch nicht angebunden.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
      pushNotification({ kind: "Profil", title: "Profil aktualisiert", text: "Änderungen im Browser gespeichert." });
    },
  }), [state, hydrated, pushNotification]);

  return <WorkspaceContext.Provider value={api}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
