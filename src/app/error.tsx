"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // El mensaje detallado queda en el runtime de Next; no se expone al cliente
    void error;
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <section className="max-w-md space-y-6 text-center border bg-card p-8 rounded-2xl shadow-md">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Algo no salió como esperábamos</h1>
          <p className="text-sm text-muted-foreground">
            Ocurrió un inconveniente al cargar la información solicitada. Puedes reintentar la operación o regresar a la portada.
          </p>
          {error?.digest && (
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Código de referencia: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button type="button" onClick={reset} className="gap-2 font-medium">
            <RotateCcw className="size-4" />
            Reintentar
          </Button>
          <Button asChild variant="outline" className="gap-2 font-medium">
            <Link href="/">
              <Home className="size-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

