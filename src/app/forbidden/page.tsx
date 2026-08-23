import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="max-w-lg space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">403</p>
        <h1 className="text-3xl font-bold">Acceso no autorizado</h1>
        <p className="text-muted-foreground">
          Tu rol no tiene alcance sobre esta sección. Si necesitas acceso, solicita la actualización al administrador.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
