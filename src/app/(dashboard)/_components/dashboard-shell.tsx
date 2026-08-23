import Link from "next/link";
import { signOut } from "../../../../auth";
import { Button } from "@/components/ui/button";
import { type AuthenticatedActor } from "@/modules/auth/guards";
import { getRoleHomePath } from "@/modules/auth/roles";

const roleLabels: Record<AuthenticatedActor["role"], string> = {
  ADMIN: "Administrador",
  JEFE: "Jefe",
  PROFESIONAL: "Profesional",
  RESIDENTE: "Residente",
};

interface DashboardShellProps {
  actor: AuthenticatedActor;
  title: string;
  description: string;
  children: React.ReactNode;
}
export function DashboardShell({
  actor,
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-lg font-bold" href={getRoleHomePath(actor.role)}>
              Medi<span className="text-primary">Absence</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {actor.name ?? actor.email ?? "Usuario"} · {roleLabels[actor.role]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/solicitar">Nueva solicitud</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/solicitudes">Mis solicitudes</Link>
            </Button>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">Salir</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
