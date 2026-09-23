import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/registrieren")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { mode: "signup", redirect: undefined } });
  },
});
