import { Activity, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12"
      aria-busy="true"
    >
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Activity className="size-7" />
          <div className="absolute -top-1 -right-1">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">Cargando MediAbsence</p>
          <p className="text-xs text-muted-foreground" role="status">
            Sincronizando estado y preparando la plataforma…
          </p>
        </div>
      </div>
    </main>
  );
}

