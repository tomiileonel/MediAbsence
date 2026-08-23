import Link from "next/link";
import { signOut } from "../../../../auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type AuthenticatedActor } from "@/modules/auth/guards";
import { getRoleHomePath } from "@/modules/auth/roles";
import {
  Activity,
  FilePlus2,
  Files,
  LayoutDashboard,
  LogOut,
  Shield,
  Stethoscope,
  User,
  UserCheck,
} from "lucide-react";

const roleLabels: Record<
  AuthenticatedActor["role"],
  { label: string; variant: "default" | "secondary" | "pending" | "info" | "outline"; icon: typeof User }
> = {
  ADMIN: { label: "Administrador", variant: "default", icon: Shield },
  JEFE: { label: "Jefe de Servicio", variant: "info", icon: UserCheck },
  PROFESIONAL: { label: "Profesional Médico", variant: "secondary", icon: Stethoscope },
  RESIDENTE: { label: "Médico Residente", variant: "outline", icon: User },
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
  const roleMeta = roleLabels[actor.role] ?? {
    label: actor.role,
    variant: "secondary" as const,
    icon: User,
  };
  const RoleIcon = roleMeta.icon;
  const homePath = getRoleHomePath(actor.role);
  const userInitials = (actor.name ?? actor.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-85"
              href={homePath}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Activity className="size-5" />
              </span>
              <span>
                Medi<span className="text-primary font-black">Absence</span>
              </span>
            </Link>

            {/* Mobile user badge */}
            <div className="flex items-center gap-2 sm:hidden">
              <Badge variant={roleMeta.variant} className="text-xs font-semibold gap-1">
                <RoleIcon className="size-3" />
                {roleMeta.label}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            {/* Desktop user profile */}
            <div className="hidden sm:flex items-center gap-2.5 pr-2 border-r border-border/60">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {userInitials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-foreground max-w-[140px] truncate">
                  {actor.name ?? actor.email}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon className="size-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {roleMeta.label}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 flex-wrap">
              <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                <Link href={homePath}>
                  <LayoutDashboard className="size-3.5 text-muted-foreground" />
                  Mi Panel
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium border-primary/20 hover:bg-primary/5">
                <Link href="/solicitar">
                  <FilePlus2 className="size-3.5 text-primary" />
                  Nueva solicitud
                </Link>
              </Button>

              <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                <Link href="/solicitudes">
                  <Files className="size-3.5 text-muted-foreground" />
                  Mis solicitudes
                </Link>
              </Button>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-3.5" />
                  Salir
                </Button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

