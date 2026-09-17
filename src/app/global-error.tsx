"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans p-4">
        <main className="max-w-md w-full text-center border bg-card p-8 rounded-2xl shadow-lg space-y-6">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <AlertTriangle className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Error crítico del sistema</h1>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error no recuperable en el nivel raíz de la aplicación.
            </p>
            {error?.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Código de referencia: {error.digest}
              </p>
            )}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="size-4" />
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
