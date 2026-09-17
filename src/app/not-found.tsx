import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <section className="max-w-md space-y-6 text-center border bg-card p-8 rounded-2xl shadow-md">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <FileQuestion className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Página no encontrada</h1>
          <p className="text-sm text-muted-foreground">
            El recurso o la sección que intentas consultar no existe o fue reubicada.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="gap-2 font-medium">
            <Link href="/">
              <Home className="size-4" />
              Regresar al inicio
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
