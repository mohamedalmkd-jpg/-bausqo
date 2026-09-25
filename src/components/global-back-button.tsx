import { useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function GlobalBackButton() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });


  return (
    <button
      type="button"
      className="bausqo-global-back"
      onClick={() => {
        if (typeof window === "undefined") return;
        if (window.history.length > 1) {
          window.history.back();
          return;
        }
        if (pathname !== "/") {
          window.location.assign("/");
        }
      }}
      aria-label="Zurück"
    >
      <ArrowLeft className="size-4" />
      <span>Zurück</span>
    </button>
  );
}
