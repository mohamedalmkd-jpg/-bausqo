import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const nav = [{ label: "Suche", to: "/marketplace" as const }, { label: "Dashboard", to: "/dashboard" as const }];

export function PublicHeader() {
  const { user, ready, signOut } = useAuth();
  const signedIn = ready && Boolean(user);

  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Brand />
      <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
        {nav.map((item) => <Link key={item.to} to={item.to} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>{item.label}</Link>)}
        {signedIn && <Link to="/meine-auftraege" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Meine Aufträge</Link>}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {signedIn ? (
          <>
            <Button asChild><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button>
            <Button variant="ghost" onClick={() => void signOut()}>Abmelden</Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost"><Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link></Button>
            <Button asChild><Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Kostenlos starten</Link></Button>
          </>
        )}
      </div>
      <Sheet>
        <SheetTrigger asChild><Button className="rounded-xl md:hidden" size="icon" variant="ghost" aria-label="Menü öffnen"><Menu /></Button></SheetTrigger>
        <SheetContent className="w-[88%]" side="right">
          <SheetTitle><Brand /></SheetTitle>
          <nav className="mt-10 grid gap-2">
            <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/marketplace">Suche</Link></Button>
            <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/dashboard">Dashboard</Link></Button>
            {signedIn ? (
              <>
                <Button asChild variant="ghost" className="justify-start rounded-xl"><Link to="/meine-auftraege">Meine Aufträge</Link></Button>
                <Button asChild className="mt-6"><Link to="/auftrag/erstellen" search={{ draft: undefined }}>Auftrag erstellen</Link></Button>
                <Button variant="outline" onClick={() => void signOut()}>Abmelden</Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="mt-6"><Link to="/auth" search={{ mode: "signin", redirect: undefined }}>Anmelden</Link></Button>
                <Button asChild><Link to="/auth" search={{ mode: "signup", redirect: undefined }}>Kostenlos starten</Link></Button>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </header>;
}
