import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <section className="max-w-md space-y-6 text-center border bg-card p-8 rounded-2xl shadow-md">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-destructive">
            Error 403 · Restricción RBAC
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Acceso no autorizado</h1>
          <p className="text-sm text-muted-foreground">
            Tu rol actual en MediAbsence no cuenta con los permisos requeridos para visualizar o gestionar esta sección.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild className="gap-2 font-medium">
            <Link href="/">
              <Home className="size-4" />
              Volver al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 font-medium">
            <Link href="/login">
              <ArrowLeft className="size-4" />
              Cambiar cuenta
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

