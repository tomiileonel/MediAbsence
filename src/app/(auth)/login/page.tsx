"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Activity, AlertCircle, ArrowLeft, Loader2, Lock, Mail } from "lucide-react";

const initialState: LoginState = { error: null };

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full h-11 font-semibold gap-2" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Ingresando al sistema…
        </>
      ) : (
        "Iniciar Sesión"
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 text-primary mb-1">
            <Activity className="size-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Medi<span className="text-primary">Absence</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Gestión Inteligente de Asistencias y Licencias Médicas
          </p>
        </div>

        <Card className="border shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Acceso a Plataforma</CardTitle>
            <CardDescription className="text-sm">
              Ingresa con tu correo institucional y contraseña asignada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@mediabsence.local"
                  required
                  inputMode="email"
                  aria-describedby="email-help"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="size-3.5" /> Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  className="h-10"
                />
              </div>

              {state.error ? (
                <div
                  className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium"
                  role="alert"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              ) : null}

              <div className="pt-2">
                <LoginSubmitButton />
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <Link
                className="inline-flex items-center gap-1 hover:text-foreground font-medium underline underline-offset-4"
                href="/"
              >
                <ArrowLeft className="size-3.5" />
                Volver a la portada principal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

