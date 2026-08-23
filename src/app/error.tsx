"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // El mensaje detallado queda en el runtime de Next; no se muestra al usuario.
    void error;
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-bold">Algo salió mal</h1>
        <p className="text-muted-foreground">
          No pudimos completar la página. Puedes reintentar o volver al inicio.
        </p>
        <div className="flex justify-center gap-3">
          <Button type="button" onClick={reset}>Reintentar</Button>
          <Button asChild variant="outline">
            <Link href="/">Inicio</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
