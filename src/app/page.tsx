import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-primary/5 rounded-b-[100%] blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-3xl text-center space-y-8 px-4">
        <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20 shadow-inner">
          <Activity className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Medi<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Absence</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Sistema inteligente y centralizado para la gestión de residencias, asistencias y licencias médicas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto">
          <Button size="lg" className="h-14 px-8 text-md font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
            <Link href="/login">Ingresar a Plataforma</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-md font-semibold rounded-full bg-background/50 backdrop-blur-sm" asChild>
            <Link href="/solicitar">Solicitar Licencia Externa</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground font-medium flex gap-2 items-center">
        <span>© {new Date().getFullYear()} Área de Salud</span>
        <span className="w-1 h-1 rounded-full bg-primary" />
        <span>V1.0</span>
      </div>
    </div>
  );
}
